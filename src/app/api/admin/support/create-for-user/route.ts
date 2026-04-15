import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { notificationService } from "@/services/notification.service";
import { z } from "zod";

const schema = z.object({
  userId: z.string().min(1),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(3).max(5000),
});

/**
 * Admin initiates a support conversation with a specific user.
 * Creates a ticket assigned to the user with admin's first message.
 * User sees it in /dashboard/support and gets a notification.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Dados inválidos", 422);
    }

    const { userId, subject, message } = parsed.data;

    // Verify user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });
    if (!targetUser) return errorResponse("Usuário não encontrado", 404);

    // Create ticket owned by the user but with admin's first message
    const ticket = await prisma.$transaction(async (tx) => {
      const created = await tx.supportTicket.create({
        data: {
          userId,
          subject,
          message,
          category: "outro",
          status: "IN_PROGRESS", // admin already opened it, so it's in progress
        },
      });

      await tx.supportMessage.create({
        data: {
          ticketId: created.id,
          senderId: session.user.id,
          senderRole: "ADMIN",
          body: message,
          readByUser: false,
          readByAdmin: true,
        },
      });

      return created;
    });

    // Notify the user
    try {
      await notificationService.notifySupportReply(
        userId,
        ticket.id,
        subject,
        message
      );
    } catch (err) {
      console.error("[admin] failed to notify user of admin-initiated ticket:", err);
    }

    return successResponse({ ticketId: ticket.id }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
