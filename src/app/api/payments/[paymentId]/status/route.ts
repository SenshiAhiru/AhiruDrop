import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAuth,
} from "@/lib/api-utils";
import { paymentService } from "@/services/payment.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    await requireAuth();
    const { paymentId } = await params;

    const payment = await paymentService.checkStatus(paymentId);

    return successResponse({
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      paidAt: payment.paidAt,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Pagamento não encontrado") {
      return errorResponse(error.message, 404);
    }
    return handleApiError(error);
  }
}
