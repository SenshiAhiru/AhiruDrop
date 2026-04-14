import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAuth } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    const { paymentIntentId, amount } = await req.json();
    if (!paymentIntentId || !amount) {
      return errorResponse("Dados inválidos", 400);
    }

    const ahcAmount = Number(amount);
    if (ahcAmount < 1 || ahcAmount > 10000) {
      return errorResponse("Valor inválido", 400);
    }

    // Verify the payment intent is actually succeeded with Stripe
    const gateway = await prisma.paymentGateway.findUnique({
      where: { name: "stripe" },
      include: { configs: true },
    });

    if (gateway) {
      const prefix = gateway.sandbox ? "test_" : "live_";
      const skConfig = gateway.configs.find((c) => c.key === `${prefix}secret_key`) ||
                       gateway.configs.find((c) => c.key === "secret_key");

      if (skConfig) {
        let secretKey: string;
        try { secretKey = decrypt(skConfig.value); } catch { secretKey = skConfig.value; }

        const stripeClient = new Stripe(secretKey);
        const pi = await stripeClient.paymentIntents.retrieve(paymentIntentId);

        if (pi.status !== "succeeded") {
          return errorResponse("Pagamento não confirmado", 400);
        }

        // Check metadata matches
        if (pi.metadata?.userId !== session.user.id) {
          return errorResponse("Pagamento não pertence a este usuário", 403);
        }

        // Check if already credited (prevent double credit)
        if (pi.metadata?.credited === "true") {
          return successResponse({ already: true, balance: 0 });
        }

        // Mark as credited in Stripe metadata
        await stripeClient.paymentIntents.update(paymentIntentId, {
          metadata: { ...pi.metadata, credited: "true" },
        });
      }
    }

    // Credit AHC
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { balance: { increment: ahcAmount } },
      select: { balance: true },
    });

    console.log(`Credited ${ahcAmount} AHC to user ${session.user.id} (PI: ${paymentIntentId})`);

    return successResponse({ credited: ahcAmount, balance: Number(updated.balance) });
  } catch (error) {
    console.error("Deposit confirm error:", error);
    return handleApiError(error);
  }
}
