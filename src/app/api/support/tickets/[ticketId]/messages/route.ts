import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAuth } from "@/lib/api-utils";
import { supportService } from "@/services/support.service";
import { ADMIN_ROLES } from "@/constants/roles";
import { z } from "zod";

const bodySchema = z.object({
  body: z.string().trim().min(1).max(5000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await requireAuth();
    const { ticketId } = await params;
    const isAdmin = ADMIN_ROLES.includes((session.user as any).role);

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Dados inválidos", 422);
    }

    const message = await supportService.addMessage(
      ticketId,
      { userId: session.user.id, isAdmin },
      parsed.data.body
    );

    return successResponse(message, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("não encontrado")) return errorResponse(error.message, 404);
      if (error.message.includes("Acesso negado")) return errorResponse(error.message, 403);
      if (error.message.includes("fechado") || error.message.includes("vazia") || error.message.includes("muito longa")) {
        return errorResponse(error.message, 400);
      }
    }
    return handleApiError(error);
  }
}
