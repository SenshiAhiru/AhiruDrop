import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const ahcAmount = Number(session.metadata?.ahcAmount || 0);

    if (!userId || !ahcAmount) {
      console.error("Missing metadata in Stripe session:", session.id);
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          balance: {
            increment: ahcAmount,
          },
        },
      });

      console.log(`Credited ${ahcAmount} AHC to user ${userId}`);
    } catch (error) {
      console.error("Failed to credit AHC:", error);
      return NextResponse.json({ error: "Failed to credit" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
