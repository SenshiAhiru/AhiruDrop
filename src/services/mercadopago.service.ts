import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { fetchWithRetry } from "@/lib/fetch-with-retry";

/**
 * Mercado Pago — PIX-only integration.
 *
 * We deliberately don't use the official MP SDK to keep dependencies light
 * and the surface tiny. We only need 3 things:
 *   1. Create a PIX payment (returns QR code + ticket URL)
 *   2. Check a payment's status (used by the frontend polling endpoint)
 *   3. Verify webhook signatures (HMAC-SHA256, x-signature header)
 *
 * Credentials are read from the PaymentGateway/PaymentGatewayConfig tables
 * keyed by gateway.name = "mercadopago", with sandbox/live prefixed keys
 * (test_access_token / live_access_token). Same pattern as Stripe.
 */

const MP_API_BASE = "https://api.mercadopago.com";
const PIX_EXPIRATION_MIN = 30;

export type MpPaymentStatus =
  | "pending"
  | "approved"
  | "authorized"
  | "in_process"
  | "in_mediation"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back";

export interface CreatePixInput {
  amountBRL: number; // value in BRL (e.g. 25.50)
  description: string;
  payerEmail: string;
  externalReference: string; // our deposit id
  metadata?: Record<string, string>;
}

export interface CreatePixOutput {
  paymentId: string;
  status: MpPaymentStatus;
  qrCode: string; // PIX "copia e cola" payload
  qrCodeBase64: string; // base64 PNG image of the QR
  ticketUrl: string;
  expiresAt: string;
}

export interface PaymentStatusOutput {
  paymentId: string;
  status: MpPaymentStatus;
  paidAt: string | null;
  amount: number;
  externalReference: string | null;
  metadata: Record<string, string>;
}

interface GatewayCreds {
  accessToken: string;
  webhookSecret: string | null;
  sandbox: boolean;
}

async function loadCreds(): Promise<GatewayCreds> {
  const gateway = await prisma.paymentGateway.findUnique({
    where: { name: "mercadopago" },
    include: { configs: true },
  });
  if (!gateway) {
    throw new Error("Gateway Mercado Pago não configurado");
  }
  if (!gateway.isActive) {
    throw new Error("Gateway Mercado Pago está desativado");
  }

  const prefix = gateway.sandbox ? "test_" : "live_";
  const find = (key: string) =>
    gateway.configs.find((c) => c.key === `${prefix}${key}`) ||
    gateway.configs.find((c) => c.key === key);

  const tokenCfg = find("access_token");
  if (!tokenCfg) throw new Error("Mercado Pago: access_token ausente");
  let accessToken: string;
  try { accessToken = decrypt(tokenCfg.value); } catch { accessToken = tokenCfg.value; }

  const secretCfg = find("webhook_secret");
  let webhookSecret: string | null = null;
  if (secretCfg) {
    try { webhookSecret = decrypt(secretCfg.value); } catch { webhookSecret = secretCfg.value; }
  }

  return { accessToken, webhookSecret, sandbox: gateway.sandbox };
}

export const mercadopagoService = {
  /**
   * Whether MP is configured and active. Used by the deposit page to
   * decide whether to show the PIX option at all.
   */
  async isAvailable(): Promise<boolean> {
    const gw = await prisma.paymentGateway.findUnique({
      where: { name: "mercadopago" },
      include: { configs: { where: { key: { contains: "access_token" } } } },
    });
    if (!gw || !gw.isActive) return false;
    return gw.configs.length > 0;
  },

  async createPix(input: CreatePixInput): Promise<CreatePixOutput> {
    const { accessToken } = await loadCreds();

    const expiresAt = new Date(Date.now() + PIX_EXPIRATION_MIN * 60 * 1000);

    const body = {
      transaction_amount: Math.round(input.amountBRL * 100) / 100,
      description: input.description,
      payment_method_id: "pix",
      external_reference: input.externalReference,
      date_of_expiration: expiresAt.toISOString(),
      payer: {
        email: input.payerEmail,
      },
      metadata: input.metadata ?? {},
    };

    const res = await fetchWithRetry(
      `${MP_API_BASE}/v1/payments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify(body),
      },
      { attempts: 2, baseDelayMs: 500, timeoutMs: 10000, label: "MP createPix" }
    );

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`MP createPix HTTP ${res.status}: ${txt.slice(0, 300)}`);
    }

    const data = (await res.json()) as {
      id: number | string;
      status: MpPaymentStatus;
      point_of_interaction?: {
        transaction_data?: {
          qr_code?: string;
          qr_code_base64?: string;
          ticket_url?: string;
        };
      };
    };

    const tx = data.point_of_interaction?.transaction_data;
    if (!tx?.qr_code || !tx?.qr_code_base64) {
      throw new Error("MP createPix: resposta sem QR Code");
    }

    return {
      paymentId: String(data.id),
      status: data.status,
      qrCode: tx.qr_code,
      qrCodeBase64: tx.qr_code_base64,
      ticketUrl: tx.ticket_url ?? "",
      expiresAt: expiresAt.toISOString(),
    };
  },

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusOutput> {
    const { accessToken } = await loadCreds();

    const res = await fetchWithRetry(
      `${MP_API_BASE}/v1/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      },
      { attempts: 2, baseDelayMs: 300, timeoutMs: 7000, label: "MP getStatus" }
    );

    if (!res.ok) {
      throw new Error(`MP getPaymentStatus HTTP ${res.status}`);
    }

    const data = (await res.json()) as {
      id: number | string;
      status: MpPaymentStatus;
      date_approved: string | null;
      transaction_amount: number;
      external_reference: string | null;
      metadata: Record<string, string> | null;
    };

    return {
      paymentId: String(data.id),
      status: data.status,
      paidAt: data.date_approved,
      amount: data.transaction_amount,
      externalReference: data.external_reference,
      metadata: data.metadata ?? {},
    };
  },

  /**
   * Verifies an MP webhook signature using the v2 (x-signature + x-request-id) format.
   * MP signs `id:<dataId>;request-id:<requestId>;ts:<ts>;` with HMAC-SHA256(webhookSecret).
   * Returns true when the signature checks out OR when no webhook_secret is configured
   * (lenient mode — caller decides whether to reject).
   */
  async verifyWebhookSignature(args: {
    xSignature: string | null;
    xRequestId: string | null;
    dataId: string | null;
  }): Promise<{ ok: boolean; reason?: string }> {
    const { webhookSecret } = await loadCreds();

    if (!webhookSecret) {
      // No secret configured — caller should treat this as a soft failure
      // and at least require the payload to look sane.
      return { ok: false, reason: "no-secret-configured" };
    }
    if (!args.xSignature || !args.xRequestId || !args.dataId) {
      return { ok: false, reason: "missing-headers" };
    }

    // x-signature is "ts=<ts>,v1=<hmac>"
    const parts = Object.fromEntries(
      args.xSignature
        .split(",")
        .map((p) => p.trim().split("=").slice(0, 2) as [string, string])
        .filter((p) => p.length === 2)
    );
    const ts = parts["ts"];
    const v1 = parts["v1"];
    if (!ts || !v1) return { ok: false, reason: "malformed-signature" };

    const manifest = `id:${args.dataId};request-id:${args.xRequestId};ts:${ts};`;
    const computed = crypto
      .createHmac("sha256", webhookSecret)
      .update(manifest)
      .digest("hex");

    const ok =
      computed.length === v1.length &&
      crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(v1));

    return { ok, reason: ok ? undefined : "mismatch" };
  },
};
