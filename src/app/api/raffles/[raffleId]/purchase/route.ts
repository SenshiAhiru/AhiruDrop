import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAuth,
} from "@/lib/api-utils";
import { orderService } from "@/services/order.service";
import { applyRateLimitWithId } from "@/lib/rate-limit";
import { z } from "zod";

const purchaseSchema = z.object({
  numbers: z.array(z.number().int().positive()).min(1).max(1000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ raffleId: string }> }
) {
  try {
    const session = await requireAuth();
    const { raffleId } = await params;

    // Rate limit: cap rapid-fire buys (number-sniping races / abuse).
    const limited = applyRateLimitWithId(req, session.user.id, {
      key: "raffle_purchase",
      limit: 20,
      windowMs: 60 * 1000,
    });
    if (limited) return limited;

    const body = await req.json().catch(() => null);
    const parsed = purchaseSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Dados inválidos", 422);
    }

    // Dedupe numbers
    const uniqueNumbers = Array.from(new Set(parsed.data.numbers));

    const result = await orderService.purchaseWithBalance(session.user.id, {
      raffleId,
      numbers: uniqueNumbers,
    });

    return successResponse({
      orderId: result.order.id,
      balance: result.balance,
      spent: result.spent,
      numbers: uniqueNumbers,
    });
  } catch (error) {
    if (error instanceof Error) {
      const knownErrors = [
        "Rifa não encontrada",
        "Esta rifa não está ativa",
        "Mínimo de",
        "Máximo de",
        "Saldo insuficiente",
        "já foram vendidos",
        "Usuário não encontrado",
      ];
      if (knownErrors.some((msg) => error.message.includes(msg))) {
        return errorResponse(error.message, 400);
      }
    }
    return handleApiError(error);
  }
}
