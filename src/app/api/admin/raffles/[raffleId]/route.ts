import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAdmin,
} from "@/lib/api-utils";
import { raffleService } from "@/services/raffle.service";
import { auditService } from "@/services/audit.service";

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

    let body: any;
    try {
      body = await req.json();
    } catch {
      return errorResponse("JSON invalido", 400);
    }

    // If only changing status, use the status transition method
    if (body.status && Object.keys(body).length === 1) {
      const updated = await raffleService.updateStatus(raffleId, body.status);
      try {
        await auditService.log(
          session.user.id,
          "RAFFLE_STATUS_CHANGED",
          "raffle",
          raffleId,
          { newStatus: body.status }
        );
      } catch {}
      return successResponse(updated);
    }

    // General update
    const updated = await raffleService.update(raffleId, body);

    try {
      await auditService.log(
        session.user.id,
        "RAFFLE_UPDATED",
        "raffle",
        raffleId,
        { changes: Object.keys(body) }
      );
    } catch {}

    return successResponse(updated);
  } catch (error) {
    console.error("PATCH raffle error:", error);
    if (error instanceof Error) {
      if (error.message === "Rifa nao encontrada") {
        return errorResponse(error.message, 404);
      }
      if (error.message.includes("Nao e possivel") || error.message.includes("Transicao")) {
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

    try {
      await auditService.log(
        session.user.id,
        "RAFFLE_DELETED",
        "raffle",
        raffleId
      );
    } catch {}

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
