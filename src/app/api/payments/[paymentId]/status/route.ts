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
    const session = await requireAuth();
    const { paymentId } = await params;

    const payment = await paymentService.checkStatus(paymentId);

    // Ownership check — a payment belongs to a user via its order. Without
    // this, any authenticated user could read any payment's status/amount by
    // guessing IDs (IDOR). 404 (not 403) so we don't confirm the ID exists.
    if (payment.order?.userId !== session.user.id) {
      return errorResponse("Pagamento não encontrado", 404);
    }

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
