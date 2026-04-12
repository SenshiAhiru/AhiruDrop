import crypto from "crypto";
import type { PaymentGatewayAdapter } from "./payment-gateway.interface";
import type {
  CreatePaymentInput,
  CreatePaymentOutput,
  WebhookResult,
  RefundResult,
  PaymentStatusType,
} from "./types";

const FETCH_TIMEOUT = 10_000;

const STATUS_MAP: Record<string, PaymentStatusType> = {
  complete: "APPROVED",
  paid: "APPROVED",
  open: "PENDING",
  unpaid: "PENDING",
  no_payment_required: "APPROVED",
  expired: "EXPIRED",
  canceled: "CANCELLED",
};

function mapSessionStatus(status: string, paymentStatus?: string): PaymentStatusType {
  if (paymentStatus && STATUS_MAP[paymentStatus]) {
    return STATUS_MAP[paymentStatus];
  }
  return STATUS_MAP[status] ?? "PENDING";
}

export class StripeAdapter implements PaymentGatewayAdapter {
  readonly name = "stripe";
  readonly displayName = "Stripe";

  private readonly secretKey: string;
  private readonly webhookSecret: string | undefined;
  private readonly baseUrl: string;

  constructor(
    config: Record<string, string>,
    private readonly sandbox: boolean,
  ) {
    if (!config.secret_key) {
      throw new Error("Stripe: secret_key é obrigatório");
    }
    this.secretKey = config.secret_key;
    this.webhookSecret = config.webhook_secret || undefined;
    this.baseUrl = "https://api.stripe.com";
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("line_items[0][price_data][currency]", input.currency.toLowerCase());
    params.append("line_items[0][price_data][unit_amount]", String(Math.round(input.amount * 100)));
    params.append("line_items[0][price_data][product_data][name]", input.description);
    params.append("line_items[0][quantity]", "1");
    params.append("customer_email", input.customerEmail);
    params.append("client_reference_id", input.orderId);
    params.append("payment_intent_data[metadata][orderId]", input.orderId);
    params.append("payment_intent_data[metadata][customerName]", input.customerName);

    if (input.callbackUrl) {
      params.append("success_url", `${input.callbackUrl}?session_id={CHECKOUT_SESSION_ID}`);
      params.append("cancel_url", input.callbackUrl);
    }

    if (input.expiresInMinutes) {
      const expiresAt = Math.floor(Date.now() / 1000) + input.expiresInMinutes * 60;
      params.append("expires_at", String(expiresAt));
    }

    if (input.metadata) {
      for (const [key, value] of Object.entries(input.metadata)) {
        params.append(`metadata[${key}]`, value);
      }
    }

    const response = await this.request("POST", "/v1/checkout/sessions", params);

    return {
      externalId: response.id as string,
      status: mapSessionStatus(
        response.status as string,
        response.payment_status as string | undefined,
      ),
      paymentUrl: (response.url as string) ?? undefined,
      expiresAt: response.expires_at
        ? new Date((response.expires_at as number) * 1000)
        : undefined,
      raw: response,
    };
  }

  async checkStatus(externalId: string): Promise<WebhookResult> {
    const response = await this.request("GET", `/v1/checkout/sessions/${externalId}`);

    let paidAt: Date | undefined;
    if (response.payment_status === "paid") {
      // Fetch payment intent for precise paid timestamp
      const piId = response.payment_intent as string | undefined;
      if (piId) {
        try {
          const pi = await this.request("GET", `/v1/payment_intents/${piId}`);
          if (pi.created) {
            paidAt = new Date((pi.created as number) * 1000);
          }
        } catch {
          // fallback: no paidAt
        }
      }
    }

    return {
      externalId: response.id as string,
      status: mapSessionStatus(
        response.status as string,
        response.payment_status as string | undefined,
      ),
      paidAt,
      method: (response.payment_method_types as string[] | undefined)?.[0],
      raw: response,
    };
  }

  async handleWebhook(
    _headers: Record<string, string>,
    body: unknown,
  ): Promise<WebhookResult> {
    const event = body as Record<string, unknown>;
    const eventType = event.type as string;
    const data = event.data as Record<string, unknown>;
    const object = data?.object as Record<string, unknown>;

    if (!object || !object.id) {
      throw new Error("Stripe webhook: objeto de evento inválido");
    }

    // For checkout.session events, fetch the latest session data
    if (eventType.startsWith("checkout.session.")) {
      return this.checkStatus(object.id as string);
    }

    // For payment_intent events, try to find associated session
    if (eventType.startsWith("payment_intent.")) {
      const status = object.status as string;
      return {
        externalId: object.id as string,
        status: mapSessionStatus(status),
        paidAt: status === "succeeded" && object.created
          ? new Date((object.created as number) * 1000)
          : undefined,
        method: (object.payment_method_types as string[] | undefined)?.[0],
        raw: object,
      };
    }

    // For charge.refunded events
    if (eventType === "charge.refunded") {
      return {
        externalId: object.payment_intent as string ?? object.id as string,
        status: "REFUNDED",
        raw: object,
      };
    }

    throw new Error(`Stripe webhook: tipo de evento não suportado "${eventType}"`);
  }

  verifyWebhookSignature(headers: Record<string, string>, rawBody: string): boolean {
    if (!this.webhookSecret) {
      console.warn("Stripe: webhook_secret não configurado, pulando verificação de assinatura");
      return true;
    }

    const signature = headers["stripe-signature"] || headers["Stripe-Signature"];
    if (!signature) {
      console.warn("Stripe: header Stripe-Signature não encontrado");
      return false;
    }

    const parts: Record<string, string> = {};
    for (const item of signature.split(",")) {
      const [key, value] = item.split("=", 2);
      if (key && value) {
        parts[key.trim()] = value.trim();
      }
    }

    const timestamp = parts.t;
    const expectedSig = parts.v1;

    if (!timestamp || !expectedSig) {
      return false;
    }

    // Reject timestamps older than 5 minutes
    const timestampAge = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
    if (timestampAge > 300) {
      console.warn("Stripe: webhook timestamp muito antigo");
      return false;
    }

    const signedPayload = `${timestamp}.${rawBody}`;
    const computedSig = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(signedPayload)
      .digest("hex");

    try {
      return crypto.timingSafeEqual(
        Buffer.from(computedSig, "hex"),
        Buffer.from(expectedSig, "hex"),
      );
    } catch {
      return false;
    }
  }

  async refund(externalId: string, amount?: number): Promise<RefundResult> {
    try {
      // First check if externalId is a session or payment_intent
      let paymentIntentId = externalId;

      if (externalId.startsWith("cs_")) {
        const session = await this.request("GET", `/v1/checkout/sessions/${externalId}`);
        paymentIntentId = session.payment_intent as string;
        if (!paymentIntentId) {
          return {
            success: false,
            raw: { error: "Sessao sem payment_intent associado" },
          };
        }
      }

      const params = new URLSearchParams();
      params.append("payment_intent", paymentIntentId);
      if (amount !== undefined) {
        params.append("amount", String(Math.round(amount * 100)));
      }

      const response = await this.request("POST", "/v1/refunds", params);

      return {
        success: response.status === "succeeded",
        refundId: response.id as string,
        raw: response,
      };
    } catch (error) {
      console.error("Stripe refund error:", error);
      return {
        success: false,
        raw: { error: error instanceof Error ? error.message : String(error) },
      };
    }
  }

  private async request(
    method: string,
    path: string,
    body?: URLSearchParams,
  ): Promise<Record<string, unknown>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.secretKey}:`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body ? body.toString() : undefined,
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        const err = (data as Record<string, unknown>).error as Record<string, unknown> | undefined;
        const msg = err?.message ?? response.statusText;
        throw new Error(`Stripe API error (${response.status}): ${msg}`);
      }

      return data as Record<string, unknown>;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error(`Stripe API timeout (${FETCH_TIMEOUT}ms)`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
