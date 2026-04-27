import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAuth,
} from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

/**
 * Lightweight polling endpoint. The PIX UI polls this every few seconds
 * until status === "COMPLETED" so it can show the success state without
 * waiting for the user to F5 manually. The webhook is what actually
 * mutates the row — this is read-only.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const session = await requireAuth();
    const { paymentId } = await params;

    const deposit = await prisma.deposit.findUnique({
      where: { paymentIntentId: paymentId },
      select: {
        userId: true,
        status: true,
        ahcTotal: true,
        completedAt: true,
        provider: true,
      },
    });

    if (!deposit) return errorResponse("Depósito não encontrado", 404);
    if (deposit.userId !== session.user.id) {
      return errorResponse("Acesso negado", 403);
    }

    return successResponse({
      status: deposit.status,
      ahcTotal: Number(deposit.ahcTotal),
      completedAt: deposit.completedAt,
      provider: deposit.provider,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
