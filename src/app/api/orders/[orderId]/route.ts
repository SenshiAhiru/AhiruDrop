import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAuth,
} from "@/lib/api-utils";
import { orderService } from "@/services/order.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await requireAuth();
    const { orderId } = await params;

    const order = await orderService.getById(orderId, session.user.id);

    return successResponse(order);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Pedido não encontrado") {
        return errorResponse(error.message, 404);
      }
      if (error.message === "Acesso negado a este pedido") {
        return errorResponse(error.message, 403);
      }
    }
    return handleApiError(error);
  }
}
