import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAdmin,
  validateBody,
} from "@/lib/api-utils";
import { raffleService } from "@/services/raffle.service";
import { auditService } from "@/services/audit.service";
import { updateRaffleSchema } from "@/validators/raffle.validator";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ raffleId: string }> }
) {
  try {
    await requireAdmin();
    const { raffleId } = await params;

    const raffle = await raffleService.getById(raffleId);
    if (!raffle) {
      return errorResponse("Rifa nao encontrada", 404);
    }

    return successResponse(raffle);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ raffleId: string }> }
) {
  try {
    const session = await requireAdmin();
    const { raffleId } = await params;
    const { data, error } = await validateBody(req, updateRaffleSchema);

    if (error) {
      return errorResponse(error, 422);
    }

    const updated = await raffleService.update(raffleId, data!);

    await auditService.log(
      session.user.id,
      "RAFFLE_UPDATED",
      "raffle",
      raffleId,
      { changes: Object.keys(data!) }
    );

    return successResponse(updated);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Rifa nao encontrada") {
        return errorResponse(error.message, 404);
      }
      if (error.message.includes("Nao e possivel alterar")) {
        return errorResponse(error.message, 400);
      }
    }
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ raffleId: string }> }
) {
  try {
    const session = await requireAdmin();
    const { raffleId } = await params;

    await raffleService.delete(raffleId);

    await auditService.log(
      session.user.id,
      "RAFFLE_DELETED",
      "raffle",
      raffleId
    );

    return successResponse({ message: "Rifa excluida com sucesso" });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Rifa nao encontrada") {
        return errorResponse(error.message, 404);
      }
      if (error.message.includes("Apenas rifas em rascunho")) {
        return errorResponse(error.message, 400);
      }
    }
    return handleApiError(error);
  }
}
