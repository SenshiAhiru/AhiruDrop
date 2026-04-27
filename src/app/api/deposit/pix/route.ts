import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAuth,
} from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { couponService } from "@/services/coupon.service";
import { fxService } from "@/services/fx.service";
import { mercadopagoService } from "@/services/mercadopago.service";
import { applyRateLimitWithId } from "@/lib/rate-limit";
import { error as logError } from "@/lib/logger";

/**
 * Create a PIX deposit via Mercado Pago.
 *
 * Currency is always BRL — PIX is a Brazilian payment rail. The user picks
 * an AHC amount; we quote it via the live USD→BRL rate (same as Stripe BRL),
 * create the PIX payment with MP, and persist a Deposit row in PENDING.
 *
 * The webhook /api/webhooks/mercadopago flips the row to COMPLETED.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    const limited = applyRateLimitWithId(req, session.user.id, {
      key: "deposit_intent",
      limit: 10,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    const { amount, couponCode } = await req.json();
    const ahcAmount = Math.floor(Number(amount));
    if (!ahcAmount || ahcAmount < 1) return errorResponse("Mínimo: 1 AHC", 400);
    if (ahcAmount > 10000) return errorResponse("Máximo: 10.000 AHC", 400);

    // Validate coupon (bonus credited on webhook, same rules as Stripe path)
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

    // Quote AHC → BRL via live FX
    const quote = await fxService.quote(ahcAmount, "BRL");
    if (quote.payAmount < 1) {
      return errorResponse("Valor muito baixo. Mínimo ≈ R$ 1,00.", 400);
    }

    // Load user's email — MP requires payer.email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });
    if (!user) return errorResponse("Usuário não encontrado", 404);

    const externalReference = `deposit_${session.user.id}_${Date.now()}`;

    const metadata: Record<string, string> = {
      user_id: session.user.id,
      ahc_amount: String(ahcAmount),
      currency: "BRL",
      usd_equivalent: quote.usdAmount.toFixed(4),
    };
    if (quote.fxRate !== null) {
      metadata.fx_usd_brl = quote.fxRate.toFixed(4);
      metadata.fx_source = quote.fxSource;
    }
    if (couponId && bonusAhc > 0 && normalizedCouponCode) {
      metadata.coupon_id = couponId;
      metadata.coupon_code = normalizedCouponCode;
      metadata.bonus_ahc = String(bonusAhc);
    }

    let pix;
    try {
      pix = await mercadopagoService.createPix({
        amountBRL: quote.payAmount,
        description: `AhiruDrop — ${ahcAmount} AHC`,
        payerEmail: user.email,
        externalReference,
        metadata,
      });
    } catch (err) {
      logError("MP createPix failed:", err);
      return errorResponse(
        err instanceof Error ? err.message : "Falha ao criar PIX",
        502
      );
    }

    try {
      await prisma.deposit.create({
        data: {
          userId: session.user.id,
          provider: "mercadopago",
          paymentIntentId: pix.paymentId,
          currency: "BRL",
          amountPaid: quote.payAmount,
          ahcBase: ahcAmount,
          ahcBonus: bonusAhc,
          ahcTotal: ahcAmount + bonusAhc,
          couponId: couponId ?? undefined,
          couponCode: normalizedCouponCode ?? undefined,
          status: "PENDING",
        },
      });
    } catch (err) {
      logError("Failed to record PIX deposit:", err);
      // Don't fail the user request — they already have the QR code.
    }

    return successResponse({
      paymentId: pix.paymentId,
      qrCode: pix.qrCode,
      qrCodeBase64: pix.qrCodeBase64,
      ticketUrl: pix.ticketUrl,
      expiresAt: pix.expiresAt,
      ahcAmount,
      ahcTotal: ahcAmount + bonusAhc,
      bonusAhc,
      payAmount: quote.payAmount,
      currency: "BRL",
      fxRate: quote.fxRate,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
