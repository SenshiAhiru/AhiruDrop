import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAuth } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ winnerId: string }> }
) {
  try {
    const session = await requireAuth();
    const { winnerId } = await params;

    const result = await prisma.winner.updateMany({
      where: { id: winnerId, userId: session.user.id, seenAt: null },
      data: { seenAt: new Date() },
    });

    if (result.count === 0) {
      return errorResponse("Vitória não encontrada ou já vista", 404);
    }

    return successResponse({ seen: true });
  } catch (error) {
    return handleApiError(error);
  }
}
