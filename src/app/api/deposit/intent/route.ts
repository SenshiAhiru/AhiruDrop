import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAuth } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { couponService } from "@/services/coupon.service";
import { applyRateLimitWithId } from "@/lib/rate-limit";
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

    // Rate limit: max 10 intents per user per hour
    const limited = applyRateLimitWithId(req, session.user.id, {
      key: "deposit_intent",
      limit: 10,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    const { amount, currency, couponCode } = await req.json();
    const ahcAmount = Number(amount);

    if (!ahcAmount || ahcAmount < 1) return errorResponse("Mínimo: 1 AHC", 400);
    if (ahcAmount > 10000) return errorResponse("Máximo: 10.000 AHC", 400);

    // Validate coupon if provided (bonus AHC credited on webhook)
    let couponId: string | null = null;
    let bonusAhc = 0;
    let normalizedCouponCode: string | null = null;
    if (typeof couponCode === "string" && couponCode.trim()) {
      try {
        const { coupon, discount } = await couponService.validate(
          couponCode.trim(),
          ahcAmount,
          session.user.id
        );
        couponId = coupon.id;
        bonusAhc = discount;
        normalizedCouponCode = coupon.code;
      } catch (err) {
        return errorResponse(
          err instanceof Error ? err.message : "Cupom inválido",
          400
        );
      }
    }

    const currencyCode = (currency || "BRL").toLowerCase();
    const stripeAmount = Math.round(ahcAmount * 100);

    const stripeClient = await getStripeClient();

    const metadata: Record<string, string> = {
      userId: session.user.id,
      ahcAmount: String(ahcAmount),
      currency: currencyCode.toUpperCase(),
    };
    if (couponId && bonusAhc > 0 && normalizedCouponCode) {
      metadata.couponId = couponId;
      metadata.couponCode = normalizedCouponCode;
      metadata.bonusAhc = String(bonusAhc);
    }

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: stripeAmount,
      currency: currencyCode,
      metadata,
      automatic_payment_methods: { enabled: true },
    });

    // Record deposit attempt (status PENDING) — completed on webhook
    try {
      await prisma.deposit.create({
        data: {
          userId: session.user.id,
          paymentIntentId: paymentIntent.id,
          currency: currencyCode.toUpperCase(),
          amountPaid: ahcAmount, // 1:1 for now (BRL). Multi-FX later.
          ahcBase: ahcAmount,
          ahcBonus: bonusAhc,
          ahcTotal: ahcAmount + bonusAhc,
          couponId: couponId ?? undefined,
          couponCode: normalizedCouponCode ?? undefined,
          status: "PENDING",
        },
      });
    } catch (err) {
      // Don't fail the intent creation if deposit log fails
      console.error("Failed to record deposit:", err);
    }

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
      bonusAhc,
    });
  } catch (error) {
    console.error("Payment Intent error:", error);
    return handleApiError(error);
  }
}
