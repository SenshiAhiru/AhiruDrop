import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAuth } from "@/lib/api-utils";
import { couponService } from "@/services/coupon.service";
import { z } from "zod";

const schema = z.object({
  code: z.string().trim().min(1).max(40),
  amount: z.number().positive(),
});

/**
 * Validates a coupon against a deposit amount.
 * The "discount" from couponService is applied as BONUS AHC on top of the purchase.
 * User still pays the full amount in currency; receives `amount + bonus` AHC.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Dados inválidos", 422);
    }

    try {
      const { coupon, discount } = await couponService.validate(
        parsed.data.code,
        parsed.data.amount,
        session.user.id
      );

      return successResponse({
        valid: true,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        bonusAhc: discount,
        totalAhc: parsed.data.amount + discount,
      });
    } catch (err) {
      return errorResponse(
        err instanceof Error ? err.message : "Cupom inválido",
        400
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}
