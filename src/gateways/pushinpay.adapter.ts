import crypto from "crypto";
import type { PaymentGatewayAdapter } from "./payment-gateway.interface";
import type {
  CreatePaymentInput,
  CreatePaymentOutput,
  WebhookResult,
  RefundResult,
  PaymentStatusType,
} from "./types";

const BASE_URL = "https://api.pushinpay.com.br/api";
const SANDBOX_BASE_URL = "https://sandbox.pushinpay.com.br/api";
const FETCH_TIMEOUT = 10_000;

const STATUS_MAP: Record<string, PaymentStatusType> = {
  pending: "PENDING",
  waiting: "PENDING",
  approved: "APPROVED",
  paid: "APPROVED",
  confirmed: "APPROVED",
  completed: "APPROVED",
  rejected: "REJECTED",
  failed: "REJECTED",
  expired: "EXPIRED",
  refunded: "REFUNDED",
  reversed: "REFUNDED",
  cancelled: "CANCELLED",
  canceled: "CANCELLED",
};

function mapStatus(status: string): PaymentStatusType {
  return STATUS_MAP[status.toLowerCase()] ?? "PENDING";
}

export class PushinPayAdapter implements PaymentGatewayAdapter {
  readonly name = "pushinpay";
  readonly displayName = "PushinPay";

  private readonly apiKey: string;
  private readonly webhookSecret: string | undefined;
  private readonly baseUrl: string;

  constructor(
    config: Record<string, string>,
    private readonly sandbox: boolean,
  ) {
    if (!config.api_key) {
      throw new Error("PushinPay: api_key e obrigatorio");
    }
    this.apiKey = config.api_key;
    this.webhookSecret = config.webhook_secret || undefined;
    this.baseUrl = sandbox ? SANDBOX_BASE_URL : BASE_URL;
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    const amountInCents = Math.round(input.amount * 100);

    const body: Record<string, unknown> = {
      value: amountInCents,
      description: input.description,
      external_reference: input.orderId,
      payer: {
        name: input.customerName,
        email: input.customerEmail,
        document: input.customerDocument ?? undefined,
      },
      notification_url: input.callbackUrl ?? undefined,
    };

    if (input.expiresInMinutes) {
      body.expiration = input.expiresInMinutes * 60; // seconds
    }

    if (input.metadata) {
      body.metadata = input.metadata;
    }

    const response = await this.request("POST", "/pix/cashIn", body);

    return {
      externalId: (response.id ?? response.transaction_id) as string,
      status: mapStatus((response.status as string) ?? "pending"),
      qrCode: (response.qr_code ?? response.pix_code) as string | undefined,
      qrCodeBase64: response.qr_code_base64
        ? `data:image/png;base64,${response.qr_code_base64}`
        : undefined,
      pixCopiaECola: (response.qr_code ?? response.pix_code ?? response.pix_copia_e_cola) as string | undefined,
      paymentUrl: response.payment_url as string | undefined,
      expiresAt: response.expires_at
        ? new Date(response.expires_at as string)
        : response.expiration
          ? new Date(Date.now() + (response.expiration as number) * 1000)
          : undefined,
      raw: response,
    };
  }

  async checkStatus(externalId: string): Promise<WebhookResult> {
    const response = await this.request("GET", `/pix/cashIn/${externalId}`);

    return {
      externalId: (response.id ?? response.transaction_id) as string,
      status: mapStatus((response.status as string) ?? "pending"),
      paidAt: response.paid_at ? new Date(response.paid_at as string) : undefined,
      method: "pix",
      raw: response,
    };
  }

  async handleWebhook(
    _headers: Record<string, string>,
    body: unknown,
  ): Promise<WebhookResult> {
    const payload = body as Record<string, unknown>;

    // PushinPay sends the transaction data directly or nested under event/data
    const event = payload.event as string | undefined;
    const data = (payload.data ?? payload) as Record<string, unknown>;

    const transactionId = (
      data.id ??
      data.transaction_id ??
      payload.id ??
      payload.transaction_id
    ) as string | undefined;

    if (!transactionId) {
      throw new Error("PushinPay webhook: transaction ID nao encontrado no payload");
    }

    // Fetch fresh status from API
    return this.checkStatus(String(transactionId));
  }

  verifyWebhookSignature(headers: Record<string, string>, rawBody: string): boolean {
    if (!this.webhookSecret) {
      console.warn("PushinPay: webhook_secret nao configurado, pulando verificacao de assinatura");
      return true;
    }

    const signature =
      headers["x-webhook-signature"] ??
      headers["X-Webhook-Signature"] ??
      headers["x-signature"] ??
      headers["X-Signature"];

    if (!signature) {
      console.warn("PushinPay: header de assinatura nao encontrado");
      return false;
    }

    const computed = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(rawBody)
      .digest("hex");

    try {
      return crypto.timingSafeEqual(
        Buffer.from(computed, "hex"),
        Buffer.from(signature, "hex"),
      );
    } catch {
      return false;
    }
  }

  async refund(externalId: string, amount?: number): Promise<RefundResult> {
    try {
      const body: Record<string, unknown> = {};
      if (amount !== undefined) {
        body.value = Math.round(amount * 100);
      }

      const response = await this.request(
        "POST",
        `/pix/cashIn/${externalId}/refund`,
        Object.keys(body).length > 0 ? body : undefined,
      );

      const status = (response.status as string) ?? "";
      return {
        success: ["approved", "completed", "refunded"].includes(status.toLowerCase()),
        refundId: (response.refund_id ?? response.id) as string | undefined,
        raw: response,
      };
    } catch (error) {
      console.error("PushinPay refund error:", error);
      return {
        success: false,
        raw: { error: error instanceof Error ? error.message : String(error) },
      };
    }
  }

  private async request(
    method: string,
    path: string,
    body?: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = (data as Record<string, unknown>).message ?? response.statusText;
        throw new Error(`PushinPay API error (${response.status}): ${msg}`);
      }

      return data as Record<string, unknown>;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error(`PushinPay API timeout (${FETCH_TIMEOUT}ms)`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
