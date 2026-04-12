import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAdmin,
} from "@/lib/api-utils";
import { drawService } from "@/services/draw.service";
import { auditService } from "@/services/audit.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ raffleId: string }> }
) {
  try {
    const session = await requireAdmin();
    const { raffleId } = await params;

    const result = await drawService.executeDraw(raffleId, session.user.id);

    await auditService.log(
      session.user.id,
      "DRAW_EXECUTED",
      "raffle",
      raffleId,
      {
        winningNumber: result.winningNumber,
        drawId: result.id,
      }
    );

    return successResponse(result);
  } catch (error) {
    if (error instanceof Error) {
      const knownErrors = [
        "Rifa não encontrada",
        "precisa estar fechada",
        "Nenhum número foi vendido",
      ];

      if (knownErrors.some((msg) => error.message.includes(msg))) {
        return errorResponse(error.message, 400);
      }
    }
    return handleApiError(error);
  }
}
