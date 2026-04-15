import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAuth } from "@/lib/api-utils";
import { supportService } from "@/services/support.service";
import { z } from "zod";

const createSchema = z.object({
  subject: z.string().trim().min(3).max(200),
  category: z.string().trim().min(1).max(40),
  message: z.string().trim().min(5).max(5000),
});

export async function GET() {
  try {
    const session = await requireAuth();
    const tickets = await supportService.listByUser(session.user.id);
    return successResponse({ data: tickets });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Dados inválidos", 422);
    }

    const ticket = await supportService.createTicket(session.user.id, parsed.data);
    return successResponse(ticket, 201);
  } catch (error) {
    if (error instanceof Error) {
      const known = ["Assunto muito", "Mensagem muito"];
      if (known.some((m) => error.message.includes(m))) {
        return errorResponse(error.message, 400);
      }
    }
    return handleApiError(error);
  }
}
