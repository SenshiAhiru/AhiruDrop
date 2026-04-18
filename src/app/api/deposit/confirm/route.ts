import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAuth } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
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

    // Prevent double-credit (webhook may have already processed)
    if (pi.metadata?.credited === "true") {
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { balance: true },
      });
      return successResponse({
        already: true,
        balance: Number(currentUser?.balance ?? 0),
      });
    }

    // Mark as credited BEFORE updating balance so concurrent webhook
    // that retrieves metadata sees it and bails.
    await stripeClient.paymentIntents.update(paymentIntentId, {
      metadata: { ...pi.metadata, credited: "true" },
    });

    const totalCredit = ahcAmount + (bonusAhc > 0 ? bonusAhc : 0);
    const couponId = pi.metadata?.couponId as string | undefined;

    // Credit AHC + record coupon redemption + mark deposit in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: session.user.id },
        data: { balance: { increment: totalCredit } },
        select: { balance: true },
      });

      await tx.deposit.updateMany({
        where: { paymentIntentId, status: "PENDING" },
        data: { status: "COMPLETED", completedAt: new Date() },
      });

      if (couponId && bonusAhc > 0) {
        // Check idempotency — don't double-record if webhook already did
        const existing = await tx.couponRedemption.findFirst({
          where: { couponId, userId: session.user.id, referenceId: paymentIntentId },
        });
        if (!existing) {
          await tx.coupon.update({
            where: { id: couponId },
            data: { currentUses: { increment: 1 } },
          });
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

      return user;
    });

    console.log(
      `Deposit confirm: credited ${totalCredit} AHC to user ${session.user.id} (PI: ${paymentIntentId})`
    );

    return successResponse({
      credited: totalCredit,
      base: ahcAmount,
      bonus: bonusAhc,
      balance: Number(updated.balance),
    });
  } catch (error) {
    console.error("Deposit confirm error:", error);
    return handleApiError(error);
  }
}
