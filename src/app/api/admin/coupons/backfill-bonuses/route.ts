import { successResponse, errorResponse, handleApiError, requireAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import Stripe from "stripe";

/**
 * One-off maintenance endpoint: for every CouponRedemption with bonusAhc=0
 * and a referenceId that looks like a Stripe PaymentIntent, fetch the PI
 * and copy metadata.bonusAhc (and metadata.ahcAmount) back into the DB.
 *
 * Also fills the deposits table if a Deposit row doesn't exist yet.
 */
export async function POST() {
  try {
    await requireAdmin();

    // Load Stripe client from DB-stored gateway config
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
    const stripe = new Stripe(secretKey);

    // Candidates: bonus still 0, referenceId present, looks like a PI id
    const candidates = await prisma.couponRedemption.findMany({
      where: {
        bonusAhc: 0,
        referenceId: { not: null, startsWith: "pi_" },
      },
      select: { id: true, referenceId: true, couponId: true, userId: true },
    });

    let updated = 0;
    let createdDeposits = 0;
    const errors: Array<{ id: string; error: string }> = [];

    for (const r of candidates) {
      if (!r.referenceId) continue;
      try {
        const pi = await stripe.paymentIntents.retrieve(r.referenceId);
        const bonusAhc = Number(pi.metadata?.bonusAhc || 0);
        const ahcAmount = Number(pi.metadata?.ahcAmount || 0);

        if (bonusAhc > 0) {
          await prisma.couponRedemption.update({
            where: { id: r.id },
            data: { bonusAhc },
          });
          updated++;
        }

        // Also fill Deposit if missing (so admin can see full context)
        const existing = await prisma.deposit.findUnique({
          where: { paymentIntentId: r.referenceId },
        });
        if (!existing && ahcAmount > 0) {
          const currency = (pi.currency || "brl").toUpperCase();
          await prisma.deposit.create({
            data: {
              userId: r.userId,
              paymentIntentId: r.referenceId,
              currency,
              amountPaid: pi.amount / 100,
              ahcBase: ahcAmount,
              ahcBonus: bonusAhc,
              ahcTotal: ahcAmount + bonusAhc,
              couponId: r.couponId,
              couponCode: pi.metadata?.couponCode ?? null,
              status: pi.status === "succeeded" ? "COMPLETED" : "PENDING",
              completedAt:
                pi.status === "succeeded" && pi.created
                  ? new Date(pi.created * 1000)
                  : null,
            },
          });
          createdDeposits++;
        }
      } catch (err) {
        errors.push({
          id: r.id,
          error: err instanceof Error ? err.message : "unknown",
        });
      }
    }

    return successResponse({
      scanned: candidates.length,
      redemptionsUpdated: updated,
      depositsCreated: createdDeposits,
      errors,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
