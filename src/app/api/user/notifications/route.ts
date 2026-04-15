import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAuth,
} from "@/lib/api-utils";
import { notificationService } from "@/services/notification.service";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = req.nextUrl;

    const page = Number(searchParams.get("page") || "1");
    const limit = Math.min(Number(searchParams.get("limit") || "20"), 100);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const result = await notificationService.getByUser(session.user.id, {
      page,
      limit,
      unreadOnly,
    });

    const unreadCount = await notificationService.countUnread(session.user.id);

    return successResponse({
      ...result,
      unreadCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();

    let body: any;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON body", 422);
    }

    if (body.all === true) {
      await notificationService.markAllAsRead(session.user.id);
      return successResponse({ message: "Todas as notificacoes marcadas como lidas" });
    }

    if (Array.isArray(body.ids) && body.ids.length > 0) {
      for (const id of body.ids) {
        await notificationService.markAsRead(id, session.user.id);
      }
      return successResponse({ message: `${body.ids.length} notificacao(oes) marcada(s) como lida(s)` });
    }

    return errorResponse("Informe 'ids' ou 'all: true'", 422);
  } catch (error) {
    return handleApiError(error);
  }
}
