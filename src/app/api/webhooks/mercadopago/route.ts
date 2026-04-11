import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PaymentGatewayFactory } from "@/gateways/payment-gateway.factory";
import { paymentService } from "@/services/payment.service";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const adapter = await PaymentGatewayFactory.create("mercadopago");

    // Verify webhook signature
    const isValid = adapter.verifyWebhookSignature(headers, rawBody);
    if (!isValid) {
      console.warn("MercadoPago webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse body and handle webhook
    const body = JSON.parse(rawBody);
    const result = await adapter.handleWebhook(headers, body);

    // Process payment status update
    await paymentService.processWebhook("mercadopago", result);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("MercadoPago webhook error:", error);
    // Always return 200 to avoid retries for non-retryable errors
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
