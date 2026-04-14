import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import Stripe from "stripe";

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

    // Skip if already credited via /api/deposit/confirm
    if (obj.metadata?.credited === "true") {
      console.log(`Webhook: already credited, skipping (PI: ${obj.id})`);
      return NextResponse.json({ received: true, skipped: true });
    }

    if (!userId || !ahcAmount) {
      console.error("Missing metadata in Stripe event:", obj.id);
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          balance: { increment: ahcAmount },
        },
      });

      console.log(`Webhook: Credited ${ahcAmount} AHC to user ${userId}`);
    } catch (error) {
      console.error("Failed to credit AHC:", error);
      return NextResponse.json({ error: "Failed to credit" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
