import crypto from "crypto";
import type { PaymentGatewayAdapter } from "./payment-gateway.interface";
import type {
  CreatePaymentInput,
  CreatePaymentOutput,
  WebhookResult,
  RefundResult,
  PaymentStatusType,
} from "./types";

const BASE_URL = "https://api.mercadopago.com";
const FETCH_TIMEOUT = 10_000;

const STATUS_MAP: Record<string, PaymentStatusType> = {
  approved: "APPROVED",
  authorized: "APPROVED",
  pending: "PENDING",
  in_process: "PENDING",
  in_mediation: "PENDING",
  rejected: "REJECTED",
  cancelled: "CANCELLED",
  refunded: "REFUNDED",
  charged_back: "REFUNDED",
};

function mapStatus(mpStatus: string): PaymentStatusType {
  return STATUS_MAP[mpStatus] ?? "PENDING";
}

export class MercadoPagoAdapter implements PaymentGatewayAdapter {
  readonly name = "mercadopago";
  readonly displayName = "Mercado Pago";

  private readonly accessToken: string;
  private readonly webhookSecret: string | undefined;

  constructor(
    config: Record<string, string>,
    private readonly sandbox: boolean,
  ) {
    if (!config.access_token) {
      throw new Error("MercadoPago: access_token é obrigatório");
    }
    this.accessToken = config.access_token;
    this.webhookSecret = config.webhook_secret || undefined;
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    const body: Record<string, unknown> = {
      transaction_amount: input.amount,
      description: input.description,
      payment_method_id: "pix",
      payer: {
        email: input.customerEmail,
        first_name: input.customerName.split(" ")[0],
        last_name: input.customerName.split(" ").slice(1).join(" ") || input.customerName,
        identification: input.customerDocument
          ? { type: "CPF", number: input.customerDocument }
          : undefined,
      },
      external_reference: input.orderId,
      notification_url: input.callbackUrl,
      metadata: input.metadata ?? {},
    };

    if (input.expiresInMinutes) {
      const expiresAt = new Date(Date.now() + input.expiresInMinutes * 60_000);
      body.date_of_expiration = expiresAt.toISOString();
    }

    const response = await this.request("POST", "/v1/payments", body);

    const pointOfInteraction = response.point_of_interaction?.transaction_data;

    return {
      externalId: String(response.id),
      status: mapStatus(response.status),
      qrCode: pointOfInteraction?.qr_code ?? undefined,
      qrCodeBase64: pointOfInteraction?.qr_code_base64
        ? `data:image/png;base64,${pointOfInteraction.qr_code_base64}`
        : undefined,
      pixCopiaECola: pointOfInteraction?.qr_code ?? undefined,
      paymentUrl: pointOfInteraction?.ticket_url ?? undefined,
      expiresAt: response.date_of_expiration
        ? new Date(response.date_of_expiration)
        : undefined,
      raw: response,
    };
  }

  async checkStatus(externalId: string): Promise<WebhookResult> {
    const response = await this.request("GET", `/v1/payments/${externalId}`);

    return {
      externalId: String(response.id),
      status: mapStatus(response.status),
      paidAt: response.date_approved ? new Date(response.date_approved) : undefined,
      method: response.payment_method_id ?? undefined,
      raw: response,
    };
  }

  async handleWebhook(
    headers: Record<string, string>,
    body: unknown,
  ): Promise<WebhookResult> {
    const payload = body as Record<string, unknown>;

    const action = payload.action as string | undefined;
    const type = payload.type as string | undefined;

    let paymentId: string | undefined;

    if (action === "payment.created" || action === "payment.updated") {
      const data = payload.data as Record<string, unknown> | undefined;
      paymentId = data?.id ? String(data.id) : undefined;
    } else if (type === "payment") {
      const data = payload.data as Record<string, unknown> | undefined;
      paymentId = data?.id ? String(data.id) : undefined;
    }

    if (!paymentId) {
      // Try query params style (older MP format)
      paymentId = payload.id ? String(payload.id) : undefined;
      if (!paymentId) {
        const topic = payload.topic as string | undefined;
        if (topic === "payment" || topic === "merchant_order") {
          paymentId = payload.id ? String(payload.id) : undefined;
        }
      }
    }

    if (!paymentId) {
      throw new Error("MercadoPago webhook: payment ID não encontrado no payload");
    }

    return this.checkStatus(paymentId);
  }

  verifyWebhookSignature(headers: Record<string, string>, rawBody: string): boolean {
    if (!this.webhookSecret) {
      console.warn("MercadoPago: webhook_secret não configurado, pulando verificação de assinatura");
      return true;
    }

    // New format: x-signature header with ts and v1
    const xSignature = headers["x-signature"] || headers["X-Signature"];
    const xRequestId = headers["x-request-id"] || headers["X-Request-Id"];

    if (xSignature && xRequestId) {
      return this.verifyNewSignatureFormat(xSignature, xRequestId, rawBody);
    }

    // Old format: x-signature with simple HMAC
    if (xSignature) {
      return this.verifyOldSignatureFormat(xSignature, rawBody);
    }

    console.warn("MercadoPago: nenhum header de assinatura encontrado");
    return false;
  }

  private verifyNewSignatureFormat(
    xSignature: string,
    xRequestId: string,
    rawBody: string,
  ): boolean {
    const parts: Record<string, string> = {};
    for (const part of xSignature.split(",")) {
      const [key, value] = part.split("=", 2);
      if (key && value) {
        parts[key.trim()] = value.trim();
      }
    }

    const ts = parts.ts;
    const v1 = parts.v1;

    if (!ts || !v1) {
      return false;
    }

    // Extract data.id from body for the manifest
    let dataId = "";
    try {
      const parsed = JSON.parse(rawBody);
      dataId = parsed?.data?.id ? String(parsed.data.id) : "";
    } catch {
      // ignore parse errors
    }

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const hmac = crypto
      .createHmac("sha256", this.webhookSecret!)
      .update(manifest)
      .digest("hex");

    return hmac === v1;
  }

  private verifyOldSignatureFormat(xSignature: string, rawBody: string): boolean {
    const hmac = crypto
      .createHmac("sha256", this.webhookSecret!)
      .update(rawBody)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(hmac, "hex"),
      Buffer.from(xSignature, "hex"),
    );
  }

  async refund(externalId: string, amount?: number): Promise<RefundResult> {
    try {
      const body: Record<string, unknown> = {};
      if (amount !== undefined) {
        body.amount = amount;
      }

      const response = await this.request(
        "POST",
        `/v1/payments/${externalId}/refunds`,
        Object.keys(body).length > 0 ? body : undefined,
      );

      return {
        success: response.status === "approved",
        refundId: response.id ? String(response.id) : undefined,
        raw: response,
      };
    } catch (error) {
      console.error("MercadoPago refund error:", error);
      return {
        success: false,
        raw: { error: error instanceof Error ? error.message : String(error) },
      };
    }
  }

  // Responses are untyped JSON from MP; use any to avoid narrowing every field.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async request(
    method: string,
    path: string,
    body?: Record<string, unknown>,
  ): Promise<any> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": crypto.randomUUID(),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = (data as Record<string, unknown>).message ?? response.statusText;
        throw new Error(`MercadoPago API error (${response.status}): ${msg}`);
      }

      return data as Record<string, unknown>;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error(`MercadoPago API timeout (${FETCH_TIMEOUT}ms)`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
