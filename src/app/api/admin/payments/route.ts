import { NextRequest } from "next/server";
import { successResponse, handleApiError, requireAdmin } from "@/lib/api-utils";
import { paymentService } from "@/services/payment.service";
import type { PaymentStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;

    const status = searchParams.get("status") as PaymentStatus | null;
    const gatewayId = searchParams.get("gateway") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = Number(searchParams.get("page") || "1");
    const limit = Math.min(Number(searchParams.get("limit") || "50"), 100);

    const result = await paymentService.listAll({
      status: status || undefined,
      gatewayId,
      search,
      page,
      limit,
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
