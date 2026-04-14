import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAuth } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import Stripe from "stripe";

async function getStripeClient(): Promise<Stripe> {
  // Load Stripe keys from database (gateway config)
  const gateway = await prisma.paymentGateway.findUnique({
    where: { name: "stripe" },
    include: { configs: true },
  });

  if (!gateway) throw new Error("Gateway Stripe não configurado");

  const prefix = gateway.sandbox ? "test_" : "live_";

  // Try prefixed key first, then unprefixed fallback
  function getConfig(key: string): string {
    const prefixed = gateway!.configs.find((c) => c.key === `${prefix}${key}`);
    const unprefixed = gateway!.configs.find((c) => c.key === key);
    const config = prefixed || unprefixed;
    if (!config) throw new Error(`Credencial "${key}" não encontrada no gateway Stripe`);
    try {
      return decrypt(config.value);
    } catch {
      return config.value;
    }
  }

  const secretKey = getConfig("secret_key");
  return new Stripe(secretKey);
}

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

    const currencyCode = (currency || "BRL").toLowerCase();
    const multiplier = 100; // All currencies use cents
    const stripeAmount = Math.round(ahcAmount * multiplier);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ahirudrop.vercel.app";

    // Get Stripe client with keys from database
    const stripeClient = await getStripeClient();

    const checkoutSession = await stripeClient.checkout.sessions.create({
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
    if (error instanceof Error && error.message.includes("não encontrada")) {
      return errorResponse(error.message, 400);
    }
    return handleApiError(error);
  }
}
