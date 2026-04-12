import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAdmin,
  validateBody,
} from "@/lib/api-utils";
import { couponService } from "@/services/coupon.service";
import { createCouponSchema } from "@/validators/coupon.validator";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;

    const isActiveParam = searchParams.get("isActive");
    const isActive =
      isActiveParam === "true" ? true : isActiveParam === "false" ? false : undefined;
    const page = Number(searchParams.get("page") || "1");
    const limit = Math.min(Number(searchParams.get("limit") || "20"), 100);
    const search = searchParams.get("search") || undefined;

    const result = await couponService.listAll({
      isActive,
      page,
      limit,
      search,
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { data, error } = await validateBody(req, createCouponSchema);

    if (error) {
      return errorResponse(error, 422);
    }

    const coupon = await couponService.create(data!);

    return successResponse(coupon, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Já existe um cupom")) {
      return errorResponse(error.message, 409);
    }
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

    const { id, ...updateData } = body;

    if (!id) {
      return errorResponse("ID do cupom é obrigatório", 422);
    }

    const updated = await couponService.update(id, updateData);

    return successResponse(updated);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Cupom não encontrado") {
        return errorResponse(error.message, 404);
      }
      if (error.message.includes("Já existe um cupom")) {
        return errorResponse(error.message, 409);
      }
    }
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();

    let body: any;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON body", 422);
    }

    const { id } = body;

    if (!id) {
      return errorResponse("ID do cupom é obrigatório", 422);
    }

    await couponService.delete(id);

    return successResponse({ message: "Cupom excluído com sucesso" });
  } catch (error) {
    if (error instanceof Error && error.message === "Cupom não encontrado") {
      return errorResponse(error.message, 404);
    }
    return handleApiError(error);
  }
}
