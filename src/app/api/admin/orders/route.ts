import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAdmin,
} from "@/lib/api-utils";
import { orderService } from "@/services/order.service";
import type { OrderStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;

    const status = searchParams.get("status") as OrderStatus | null;
    const search = searchParams.get("search") || undefined;
    const page = Number(searchParams.get("page") || "1");
    const limit = Math.min(Number(searchParams.get("limit") || "20"), 100);

    const result = await orderService.listAll({
      status: status || undefined,
      search,
      page,
      limit,
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();

    let body: any;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON body", 422);
    }

    const { orderId, action } = body;

    if (!orderId || !action) {
      return errorResponse("orderId e action sao obrigatorios", 422);
    }

    let result;

    switch (action) {
      case "approve": {
        const order = await orderService.getById(orderId);
        // Manually approve sets order to CONFIRMED
        const { orderRepository } = await import("@/repositories/order.repository");
        const { raffleNumberRepository } = await import("@/repositories/raffle-number.repository");
        await orderRepository.updateStatus(orderId, "CONFIRMED");
        await raffleNumberRepository.confirmNumbers(orderId);
        result = await orderService.getById(orderId);
        break;
      }
      case "cancel": {
        result = await orderService.cancel(orderId);
        break;
      }
      default:
        return errorResponse(`Acao '${action}' nao reconhecida`, 400);
    }

    return successResponse(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Pedido nao encontrado") {
        return errorResponse(error.message, 404);
      }
      if (error.message.includes("Apenas pedidos pendentes")) {
        return errorResponse(error.message, 400);
      }
    }
    return handleApiError(error);
  }
}
