import type { CreatePaymentInput, CreatePaymentOutput, WebhookResult, RefundResult } from "./types";

export interface PaymentGatewayAdapter {
  readonly name: string;
  readonly displayName: string;

  createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput>;
  checkStatus(externalId: string): Promise<WebhookResult>;
  handleWebhook(headers: Record<string, string>, body: unknown): Promise<WebhookResult>;
  verifyWebhookSignature(headers: Record<string, string>, rawBody: string): boolean;
  refund(externalId: string, amount?: number): Promise<RefundResult>;
}
