import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAuth,
  validateBody,
} from "@/lib/api-utils";
import { paymentService } from "@/services/payment.service";
import { createPaymentSchema } from "@/validators/payment.validator";

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const { data, error } = await validateBody(req, createPaymentSchema);

    if (error) {
      return errorResponse(error, 422);
    }

    const payment = await paymentService.createPayment(
      data!.orderId,
      data!.gatewayName,
      data!.method
    );

    return successResponse({
      id: payment.id,
      externalId: payment.externalId,
      paymentUrl: payment.paymentUrl,
      qrCode: payment.qrCode,
      qrCodeBase64: payment.qrCodeBase64,
    }, 201);
  } catch (error) {
    if (error instanceof Error) {
      const knownErrors = [
        "Pedido não encontrado",
        "Apenas pedidos pendentes",
        "Nenhum gateway",
      ];

      if (knownErrors.some((msg) => error.message.includes(msg))) {
        return errorResponse(error.message, 400);
      }
    }
    return handleApiError(error);
  }
}
