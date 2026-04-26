import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAuth } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { log, warn, error as logError } from "@/lib/logger";
import Stripe from "stripe";

/**
 * Fallback confirmation when the Stripe webhook hasn't fired yet
 * (user returns from Stripe before webhook delivery). This route trusts
 * ONLY the PaymentIntent metadata from Stripe — never the client body —
 * to compute how much AHC to credit.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    const { paymentIntentId } = await req.json();
    if (!paymentIntentId || typeof paymentIntentId !== "string") {
      return errorResponse("paymentIntentId obrigatório", 400);
    }

    const gateway = await prisma.paymentGateway.findUnique({
      where: { name: "stripe" },
      include: { configs: true },
    });
    if (!gateway) return errorResponse("Gateway Stripe não configurado", 503);

    const prefix = gateway.sandbox ? "test_" : "live_";
    const skConfig =
      gateway.configs.find((c) => c.key === `${prefix}secret_key`) ||
      gateway.configs.find((c) => c.key === "secret_key");
    if (!skConfig) return errorResponse("Credencial Stripe ausente", 503);

    let secretKey: string;
    try { secretKey = decrypt(skConfig.value); } catch { secretKey = skConfig.value; }

    const stripeClient = new Stripe(secretKey);
    const pi = await stripeClient.paymentIntents.retrieve(paymentIntentId);

    if (pi.status !== "succeeded") {
      return errorResponse("Pagamento não confirmado", 400);
    }

    if (pi.metadata?.userId !== session.user.id) {
      return errorResponse("Pagamento não pertence a este usuário", 403);
    }

    // Read amount from metadata (server-trusted source), NEVER from client body
    const ahcAmount = Number(pi.metadata?.ahcAmount);
    const bonusAhc = Number(pi.metadata?.bonusAhc || 0);
    if (!Number.isFinite(ahcAmount) || ahcAmount < 1 || ahcAmount > 10000) {
      return errorResponse("Metadata de AHC inválida no pagamento", 400);
    }

    const totalCredit = ahcAmount + (bonusAhc > 0 ? bonusAhc : 0);
    const couponId = pi.metadata?.couponId as string | undefined;

    // ── DB-level idempotency: race-safe with the Stripe webhook ───────
    // The Deposit row created at /api/deposit/intent transitions PENDING →
    // COMPLETED exactly once. updateMany with the PENDING filter returns
    // affected=1 for the winner and 0 for the loser. No TOCTOU window.
    const updated = await prisma.$transaction(async (tx) => {
      const claim = await tx.deposit.updateMany({
        where: { paymentIntentId, status: "PENDING" },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
      if (claim.count === 0) {
        // Webhook beat us. Just return current balance.
        const u = await tx.user.findUnique({
          where: { id: session.user.id },
          select: { balance: true },
        });
        return { balance: u?.balance ?? 0, already: true };
      }

      const user = await tx.user.update({
        where: { id: session.user.id },
        data: { balance: { increment: totalCredit } },
        select: { balance: true },
      });

      if (couponId && bonusAhc > 0) {
        const existing = await tx.couponRedemption.findFirst({
          where: { couponId, userId: session.user.id, referenceId: paymentIntentId },
        });
        if (!existing) {
          // Atomic increment that respects maxUses. Same SQL as
          // couponService.incrementUseAtomic but inlined to stay inside
          // the active transaction.
          const affected = await tx.$executeRaw`
            UPDATE "coupons"
            SET "currentUses" = "currentUses" + 1, "updatedAt" = NOW()
            WHERE "id" = ${couponId}
              AND ("maxUses" IS NULL OR "currentUses" < "maxUses")
          `;
          if (affected !== 1) {
            warn(
              `[deposit/confirm] coupon ${couponId} exhausted before increment — ` +
              `bonus already paid, redemption row skipped.`
            );
          } else {
            await tx.couponRedemption.create({
              data: {
                couponId,
                userId: session.user.id,
                context: "deposit",
                referenceId: paymentIntentId,
                bonusAhc,
              },
            });
          }
        }
      }

      return { balance: user.balance, already: false };
    });

    if (updated.already) {
      return successResponse({
        already: true,
        balance: Number(updated.balance),
      });
    }

    log(
      `Deposit confirm: credited ${totalCredit} AHC to user ${session.user.id} (PI: ${paymentIntentId})`
    );

    return successResponse({
      credited: totalCredit,
      base: ahcAmount,
      bonus: bonusAhc,
      balance: Number(updated.balance),
    });
  } catch (error) {
    logError("Deposit confirm error:", error);
    return handleApiError(error);
  }
}
