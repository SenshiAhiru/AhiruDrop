import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAuth } from "@/lib/api-utils";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    let body: any;
    try {
      body = await req.json();
    } catch {
      return errorResponse("JSON inválido", 400);
    }

    const { amount, currency } = body;
    const ahcAmount = Number(amount);

    if (!ahcAmount || ahcAmount < 1) {
      return errorResponse("Quantidade mínima: 1 AHC", 400);
    }

    if (ahcAmount > 10000) {
      return errorResponse("Quantidade máxima: 10.000 AHC", 400);
    }

    // Currency mapping for Stripe (smallest unit)
    // 1:1 rate, so amount in AHC = amount in currency
    const currencyCode = (currency || "BRL").toLowerCase();
    const currencyMultiplier: Record<string, number> = {
      brl: 100, // cents
      usd: 100,
      eur: 100,
      gbp: 100,
      rub: 100,
    };

    const multiplier = currencyMultiplier[currencyCode] || 100;
    const stripeAmount = Math.round(ahcAmount * multiplier);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ahirudrop.vercel.app";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currencyCode,
            product_data: {
              name: `${ahcAmount} AhiruCoins (AHC)`,
              description: `Depósito de ${ahcAmount} AHC na sua conta AhiruDrop`,
              images: [`${appUrl}/ahc-coin.png`],
            },
            unit_amount: stripeAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        ahcAmount: String(ahcAmount),
        currency: currencyCode.toUpperCase(),
      },
      success_url: `${appUrl}/dashboard/deposit/success?amount=${ahcAmount}`,
      cancel_url: `${appUrl}/dashboard/deposit`,
    });

    return successResponse({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return handleApiError(error);
  }
}
