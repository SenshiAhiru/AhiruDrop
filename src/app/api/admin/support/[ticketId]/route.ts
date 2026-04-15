import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAdmin } from "@/lib/api-utils";
import { supportService } from "@/services/support.service";
import { auditService } from "@/services/audit.service";
import type { TicketStatus } from "@prisma/client";

const VALID_STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await requireAdmin();
    const { ticketId } = await params;

    const body = await req.json().catch(() => null);
    const status = body?.status as TicketStatus | undefined;

    if (!status || !VALID_STATUSES.includes(status)) {
      return errorResponse("Status inválido", 422);
    }

    const ticket = await supportService.updateStatus(ticketId, status);

    await auditService.log(
      session.user.id,
      "SUPPORT_STATUS_CHANGED",
      "support_ticket",
      ticketId,
      { status }
    );

    return successResponse(ticket);
  } catch (error) {
    if (error instanceof Error && error.message.includes("não encontrado")) {
      return errorResponse(error.message, 404);
    }
    return handleApiError(error);
  }
}
