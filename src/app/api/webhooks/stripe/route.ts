import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { notificationService } from "@/services/notification.service";
import Stripe from "stripe";

const BIG_DEPOSIT_THRESHOLD_AHC = 500;

async function getWebhookSecrets(): Promise<string[]> {
  try {
    const gateway = await prisma.paymentGateway.findUnique({
      where: { name: "stripe" },
      include: { configs: true },
    });
    if (!gateway) return [];

    const secrets: string[] = [];

    // Try all possible webhook secret keys
    for (const key of ["test_webhook_secret", "live_webhook_secret", "webhook_secret"]) {
      const config = gateway.configs.find((c) => c.key === key);
      if (config) {
        try {
          secrets.push(decrypt(config.value));
        } catch {
          secrets.push(config.value);
        }
      }
    }

    // Also try env var as fallback
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      secrets.push(process.env.STRIPE_WEBHOOK_SECRET);
    }

    return secrets;
  } catch {
    return process.env.STRIPE_WEBHOOK_SECRET ? [process.env.STRIPE_WEBHOOK_SECRET] : [];
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("Stripe webhook: missing signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const secrets = await getWebhookSecrets();
  if (secrets.length === 0) {
    console.error("Stripe webhook: no webhook secrets configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  // Try each configured secret; one must verify the signature.
  const tempStripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_dummy");
  let event: Stripe.Event | null = null;
  for (const secret of secrets) {
    try {
      event = tempStripe.webhooks.constructEvent(body, signature, secret);
      break;
    } catch {
      continue;
    }
  }

  if (!event) {
    console.error("Stripe webhook: signature failed all configured secrets");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const eventType = event.type;

  if (eventType === "checkout.session.completed" || eventType === "payment_intent.succeeded") {
    const obj = event.data.object as any;

    const userId = obj.metadata?.userId;
    const ahcAmount = Number(obj.metadata?.ahcAmount || 0);
    const bonusAhc = Number(obj.metadata?.bonusAhc || 0);
    const couponId = obj.metadata?.couponId as string | undefined;
    const couponCode = obj.metadata?.couponCode as string | undefined;

    if (!userId || !ahcAmount) {
      console.error("Missing metadata in Stripe event:", obj.id);
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    // Idempotency: if credited flag is already set in PI metadata, skip.
    // The /api/deposit/confirm route may have processed this first.
    if (obj.metadata?.credited === "true") {
      console.log(`Webhook: PI ${obj.id} already credited — skipping`);
      return NextResponse.json({ received: true, skipped: "already_credited" });
    }

    const totalCredit = ahcAmount + (bonusAhc > 0 ? bonusAhc : 0);

    try {
      // Mark credited first to close the race with /deposit/confirm
      if (eventType === "payment_intent.succeeded") {
        try {
          const gateway = await prisma.paymentGateway.findUnique({
            where: { name: "stripe" },
            include: { configs: true },
          });
          const prefix = gateway?.sandbox ? "test_" : "live_";
          const skConfig =
            gateway?.configs.find((c) => c.key === `${prefix}secret_key`) ||
            gateway?.configs.find((c) => c.key === "secret_key");
          if (skConfig) {
            let secretKey: string;
            try { secretKey = decrypt(skConfig.value); } catch { secretKey = skConfig.value; }
            const stripeClient = new Stripe(secretKey);
            await stripeClient.paymentIntents.update(obj.id, {
              metadata: { ...obj.metadata, credited: "true" },
            });
          }
        } catch (err) {
          console.error("Failed to mark PI as credited:", err);
          // Continue — DB-level idempotency on CouponRedemption still protects coupon counts
        }
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          balance: { increment: totalCredit },
        },
        select: { name: true },
      });

      // Mark the deposit row as COMPLETED (best-effort)
      try {
        await prisma.deposit.updateMany({
          where: { paymentIntentId: obj.id, status: "PENDING" },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
      } catch (err) {
        console.error("Failed to mark deposit COMPLETED:", err);
      }

      // Increment coupon usage + record per-user redemption (idempotent on referenceId)
      if (couponId && bonusAhc > 0) {
        try {
          const existing = await prisma.couponRedemption.findFirst({
            where: { couponId, userId, referenceId: obj.id },
          });
          if (!existing) {
            await prisma.$transaction([
              prisma.coupon.update({
                where: { id: couponId },
                data: { currentUses: { increment: 1 } },
              }),
              prisma.couponRedemption.create({
                data: {
                  couponId,
                  userId,
                  context: "deposit",
                  referenceId: obj.id,
                  bonusAhc,
                },
              }),
            ]);
          }
        } catch (err) {
          console.error("Failed to record coupon usage:", err);
        }
      }

      console.log(
        `Webhook: Credited ${totalCredit} AHC (base ${ahcAmount}${
          bonusAhc > 0 ? ` + bonus ${bonusAhc} via ${couponCode}` : ""
        }) to user ${userId}`
      );

      // Notify admins if deposit crosses the threshold
      if (totalCredit >= BIG_DEPOSIT_THRESHOLD_AHC) {
        try {
          await notificationService.notifyAdminsBigDeposit(
            userId,
            updated.name ?? "Usuário",
            totalCredit
          );
        } catch (err) {
          console.error("Failed to notify admins of big deposit:", err);
        }
      }
    } catch (error) {
      console.error("Failed to credit AHC:", error);
      return NextResponse.json({ error: "Failed to credit" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
