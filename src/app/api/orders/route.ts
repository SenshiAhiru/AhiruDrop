import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAuth,
  validateBody,
} from "@/lib/api-utils";
import { orderService } from "@/services/order.service";
import { createOrderSchema } from "@/validators/order.validator";
import type { OrderStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = req.nextUrl;

    const page = Number(searchParams.get("page") || "1");
    const limit = Math.min(Number(searchParams.get("limit") || "20"), 100);
    const status = searchParams.get("status") as OrderStatus | null;

    const result = await orderService.listByUser(session.user.id, {
      page,
      limit,
      status: status || undefined,
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { data, error } = await validateBody(req, createOrderSchema);

    if (error) {
      return errorResponse(error, 422);
    }

    const order = await orderService.create(session.user.id, data!);

    return successResponse(order, 201);
  } catch (error) {
    if (error instanceof Error) {
      const knownErrors = [
        "Rifa não encontrada",
        "Esta rifa não está ativa",
        "Mínimo de",
        "Máximo de",
        "números não estão disponíveis",
      ];

      if (knownErrors.some((msg) => error.message.includes(msg))) {
        return errorResponse(error.message, 400);
      }
    }
    return handleApiError(error);
  }
}
