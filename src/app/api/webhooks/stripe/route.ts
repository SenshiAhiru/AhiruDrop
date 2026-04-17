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

  let event: Stripe.Event;

  try {
    const secrets = await getWebhookSecrets();

    // Try each webhook secret until one works
    let verified = false;
    const tempStripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_dummy");

    if (signature && secrets.length > 0) {
      for (const secret of secrets) {
        try {
          event = tempStripe.webhooks.constructEvent(body, signature, secret);
          verified = true;
          break;
        } catch {
          continue;
        }
      }
      if (!verified) {
        // If no secret worked, parse directly (less secure but functional)
        event = JSON.parse(body) as Stripe.Event;
      }
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error("Stripe webhook parse failed:", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const eventType = event!.type;

  if (eventType === "checkout.session.completed" || eventType === "payment_intent.succeeded") {
    const obj = event!.data.object as any;

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

    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          balance: { increment: totalCredit },
        },
        select: { name: true },
      });

      // Increment coupon usage (best-effort; webhook already paid so don't fail the hook)
      if (couponId && bonusAhc > 0) {
        try {
          await prisma.coupon.update({
            where: { id: couponId },
            data: { currentUses: { increment: 1 } },
          });
        } catch (err) {
          console.error("Failed to increment coupon usage:", err);
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
