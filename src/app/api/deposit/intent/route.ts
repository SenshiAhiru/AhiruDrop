import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAuth } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import Stripe from "stripe";

async function getStripeClient(): Promise<Stripe> {
  const gateway = await prisma.paymentGateway.findUnique({
    where: { name: "stripe" },
    include: { configs: true },
  });

  if (!gateway) throw new Error("Gateway Stripe não configurado");

  const prefix = gateway.sandbox ? "test_" : "live_";

  function getConfig(key: string): string {
    const prefixed = gateway!.configs.find((c) => c.key === `${prefix}${key}`);
    const unprefixed = gateway!.configs.find((c) => c.key === key);
    const config = prefixed || unprefixed;
    if (!config) throw new Error(`Credencial "${key}" não encontrada`);
    try { return decrypt(config.value); } catch { return config.value; }
  }

  return new Stripe(getConfig("secret_key"));
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    const { amount, currency } = await req.json();
    const ahcAmount = Number(amount);

    if (!ahcAmount || ahcAmount < 1) return errorResponse("Mínimo: 1 AHC", 400);
    if (ahcAmount > 10000) return errorResponse("Máximo: 10.000 AHC", 400);

    const currencyCode = (currency || "BRL").toLowerCase();
    const stripeAmount = Math.round(ahcAmount * 100);

    const stripeClient = await getStripeClient();

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: stripeAmount,
      currency: currencyCode,
      metadata: {
        userId: session.user.id,
        ahcAmount: String(ahcAmount),
        currency: currencyCode.toUpperCase(),
      },
      automatic_payment_methods: { enabled: true },
    });

    // Get publishable key for frontend
    const gateway = await prisma.paymentGateway.findUnique({
      where: { name: "stripe" },
      include: { configs: true },
    });
    const prefix = gateway?.sandbox ? "test_" : "live_";
    const pkConfig = gateway?.configs.find((c) => c.key === `${prefix}publishable_key`) ||
                     gateway?.configs.find((c) => c.key === "publishable_key");
    let publishableKey = "";
    if (pkConfig) {
      try { publishableKey = decrypt(pkConfig.value); } catch { publishableKey = pkConfig.value; }
    }

    return successResponse({
      clientSecret: paymentIntent.client_secret,
      publishableKey,
    });
  } catch (error) {
    console.error("Payment Intent error:", error);
    return handleApiError(error);
  }
}
