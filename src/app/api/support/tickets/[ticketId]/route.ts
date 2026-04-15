import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAuth } from "@/lib/api-utils";
import { supportService } from "@/services/support.service";
import { ADMIN_ROLES } from "@/constants/roles";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await requireAuth();
    const { ticketId } = await params;
    const isAdmin = ADMIN_ROLES.includes((session.user as any).role);

    const ticket = await supportService.getWithMessages(ticketId, {
      userId: session.user.id,
      isAdmin,
    });

    return successResponse(ticket);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("não encontrado")) return errorResponse(error.message, 404);
      if (error.message.includes("Acesso negado")) return errorResponse(error.message, 403);
    }
    return handleApiError(error);
  }
}
