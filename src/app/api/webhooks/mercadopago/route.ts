import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mercadopagoService } from "@/services/mercadopago.service";
import { notificationService } from "@/services/notification.service";
import { log, warn, error as logError } from "@/lib/logger";

const BIG_DEPOSIT_THRESHOLD_AHC = 500;

/**
 * Mercado Pago webhook handler.
 *
 * MP fires this for every event on a payment. We only care about
 * `type = "payment"` events — fetch the payment from MP API, check status,
 * and (if approved) credit the user's AHC.
 *
 * Idempotency: same DB-level guard as the Stripe webhook. We flip the
 * Deposit row PENDING → COMPLETED via updateMany with a status filter;
 * only the first caller wins affected=1, retries see 0 and skip.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  let rawBody: string;
  try {
    rawBody = await req.text();
    body = rawBody ? JSON.parse(rawBody) : {};
  } catch (err) {
    logError("MP webhook: invalid JSON", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // MP webhooks are JSON like { action: "payment.updated", data: { id: "..." }, type: "payment", ... }
  const payload = body as {
    action?: string;
    type?: string;
    data?: { id?: string | number };
  };

  if (payload.type !== "payment" || !payload.data?.id) {
    // Not a payment event — ack and ignore (subscription updates, etc.)
    return NextResponse.json({ received: true, ignored: payload.type });
  }

  const paymentId = String(payload.data.id);

  // ── Verify signature ────────────────────────────────────────────
  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");

  try {
    const sig = await mercadopagoService.verifyWebhookSignature({
      xSignature,
      xRequestId,
      dataId: paymentId,
    });
    if (!sig.ok && sig.reason !== "no-secret-configured") {
      logError(`MP webhook: signature failed (${sig.reason})`);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    if (sig.reason === "no-secret-configured") {
      // Soft mode — webhook secret missing in admin config. Continue but
      // log it loudly so ops sees and configures.
      warn("MP webhook: no webhook_secret configured — skipping verification");
    }
  } catch (err) {
    logError("MP webhook: signature check threw", err);
    // Don't expose internals; refuse on safety.
    return NextResponse.json({ error: "Signature check failed" }, { status: 400 });
  }

  // ── Fetch fresh status from MP ──────────────────────────────────
  let pmt;
  try {
    pmt = await mercadopagoService.getPaymentStatus(paymentId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // 404 → payment doesn't exist (simulator test, or MP-side cleanup).
    // Retrying won't help — ack with 200 so MP stops retrying.
    if (msg.includes("HTTP 404")) {
      warn(`MP webhook: payment ${paymentId} not found (likely simulator) — acking`);
      return NextResponse.json({ received: true, ignored: "payment_not_found" });
    }
    logError(`MP webhook: failed to fetch payment ${paymentId}`, err);
    return NextResponse.json({ error: "Failed to fetch payment" }, { status: 502 });
  }

  if (pmt.status !== "approved") {
    log(`MP webhook: payment ${paymentId} status=${pmt.status} — not crediting yet`);
    return NextResponse.json({ received: true, status: pmt.status });
  }

  // ── Read metadata (snake_case keys per createPix above) ─────────
  const userId = pmt.metadata.user_id;
  const ahcAmount = Number(pmt.metadata.ahc_amount || 0);
  const bonusAhc = Number(pmt.metadata.bonus_ahc || 0);
  const couponId = pmt.metadata.coupon_id as string | undefined;
  const couponCode = pmt.metadata.coupon_code as string | undefined;

  if (!userId || !ahcAmount) {
    logError(`MP webhook: payment ${paymentId} missing metadata`, pmt.metadata);
    return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
  }

  const totalCredit = ahcAmount + (bonusAhc > 0 ? bonusAhc : 0);

  let updated: { name: string | null } | null = null;
  try {
    // Idempotency: flip Deposit row PENDING → COMPLETED, only first wins.
    const claim = await prisma.deposit.updateMany({
      where: { paymentIntentId: paymentId, status: "PENDING" },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
    if (claim.count === 0) {
      log(`MP webhook: payment ${paymentId} already credited — skipping`);
      return NextResponse.json({ received: true, skipped: "already_credited" });
    }

    updated = await prisma.user.update({
      where: { id: userId },
      data: { balance: { increment: totalCredit } },
      select: { name: true },
    });

    // Coupon redemption (atomic increment + redemption row)
    if (couponId && bonusAhc > 0) {
      try {
        const existing = await prisma.couponRedemption.findFirst({
          where: { couponId, userId, referenceId: paymentId },
        });
        if (!existing) {
          const { couponService } = await import("@/services/coupon.service");
          const inc = await couponService.incrementUseAtomic(couponId);
          if (!inc.ok) {
            warn(
              `[mp webhook] coupon ${couponId} exhausted before this credit ` +
              `could be counted (race). Bonus already paid; redemption row skipped.`
            );
          } else {
            await prisma.couponRedemption.create({
              data: {
                couponId,
                userId,
                context: "deposit",
                referenceId: paymentId,
                bonusAhc,
              },
            });
          }
        }
      } catch (err) {
        logError("MP webhook: failed to record coupon usage:", err);
      }
    }

    log(
      `MP webhook: Credited ${totalCredit} AHC (base ${ahcAmount}${
        bonusAhc > 0 ? ` + bonus ${bonusAhc} via ${couponCode}` : ""
      }) to user ${userId} via PIX`
    );

    if (updated && totalCredit >= BIG_DEPOSIT_THRESHOLD_AHC) {
      try {
        await notificationService.notifyAdminsBigDeposit(
          userId,
          updated.name ?? "Usuário",
          totalCredit
        );
      } catch (err) {
        logError("MP webhook: failed to notify admins of big deposit:", err);
      }
    }
  } catch (err) {
    logError("MP webhook: failed to credit AHC:", err);
    return NextResponse.json({ error: "Failed to credit" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
