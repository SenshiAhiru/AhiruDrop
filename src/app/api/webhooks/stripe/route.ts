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

    const totalCredit = ahcAmount + (bonusAhc > 0 ? bonusAhc : 0);

    let updated: { name: string | null } | null = null;
    try {
      // ── DB-level idempotency guard ─────────────────────────────────
      // The Deposit row created at /api/deposit/intent transitions PENDING →
      // COMPLETED exactly once. Using updateMany with the PENDING filter,
      // only one caller (this webhook OR /deposit/confirm) wins the
      // affected=1 — losers see 0 and skip the credit. This sidesteps the
      // TOCTOU on the Stripe metadata `credited` flag.
      const claim = await prisma.deposit.updateMany({
        where: { paymentIntentId: obj.id, status: "PENDING" },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
      if (claim.count === 0) {
        console.log(`Webhook: PI ${obj.id} already credited — skipping`);
        return NextResponse.json({ received: true, skipped: "already_credited" });
      }

      updated = await prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: totalCredit } },
        select: { name: true },
      });

      // Increment coupon usage + record per-user redemption (idempotent on referenceId).
      // Uses incrementUseAtomic to enforce maxUses at the DB level — if two
      // simultaneous deposits race for the last slot, only one wins.
      if (couponId && bonusAhc > 0) {
        try {
          const existing = await prisma.couponRedemption.findFirst({
            where: { couponId, userId, referenceId: obj.id },
          });
          if (!existing) {
            const { couponService } = await import("@/services/coupon.service");
            const inc = await couponService.incrementUseAtomic(couponId);
            if (!inc.ok) {
              console.warn(
                `[stripe webhook] coupon ${couponId} exhausted before this credit ` +
                `could be counted (race). Bonus already paid; redemption row skipped.`
              );
            } else {
              await prisma.couponRedemption.create({
                data: {
                  couponId,
                  userId,
                  context: "deposit",
                  referenceId: obj.id,
                  bonusAhc,
                },
              });
            }
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
      if (updated && totalCredit >= BIG_DEPOSIT_THRESHOLD_AHC) {
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
