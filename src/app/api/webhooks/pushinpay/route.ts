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

    const adapter = await PaymentGatewayFactory.create("pushinpay");

    // Verify webhook signature
    const isValid = adapter.verifyWebhookSignature(headers, rawBody);
    if (!isValid) {
      console.warn("PushinPay webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse body and handle webhook
    const body = JSON.parse(rawBody);
    const result = await adapter.handleWebhook(headers, body);

    // Process payment status update
    await paymentService.processWebhook("pushinpay", result);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("PushinPay webhook error:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
