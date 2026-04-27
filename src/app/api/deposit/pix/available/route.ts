import { successResponse, handleApiError } from "@/lib/api-utils";
import { mercadopagoService } from "@/services/mercadopago.service";

/**
 * Public endpoint — returns whether the PIX (Mercado Pago) gateway is
 * configured and active. Used by the deposit page to decide whether to
 * show the PIX option in the method picker.
 */
export async function GET() {
  try {
    const available = await mercadopagoService.isAvailable();
    return successResponse({ available });
  } catch (error) {
    return handleApiError(error);
  }
}
