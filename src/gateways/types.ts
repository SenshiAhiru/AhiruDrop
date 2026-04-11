export type PaymentStatusType = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "REFUNDED" | "CANCELLED";

export interface CreatePaymentInput {
  orderId: string;
  amount: number;
  currency: string;
  method?: string;
  customerEmail: string;
  customerName: string;
  customerDocument?: string;
  description: string;
  expiresInMinutes?: number;
  callbackUrl?: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentOutput {
  externalId: string;
  status: PaymentStatusType;
  paymentUrl?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  pixCopiaECola?: string;
  barcodeUrl?: string;
  expiresAt?: Date;
  raw: Record<string, unknown>;
}

export interface WebhookResult {
  externalId: string;
  status: PaymentStatusType;
  paidAt?: Date;
  method?: string;
  raw: Record<string, unknown>;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  raw: Record<string, unknown>;
}
