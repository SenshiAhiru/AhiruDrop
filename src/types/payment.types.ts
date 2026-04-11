import { PaymentStatus } from "@/constants/payment-status";

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  displayName: string;
  isActive: boolean;
  isDefault: boolean;
  sandbox: boolean;
  configs: Record<string, string>;
}

export interface CreatePaymentInput {
  orderId: string;
  gatewayName: string;
  method?: string;
}

export interface WebhookResult {
  success: boolean;
  orderId?: string;
  paymentId?: string;
  status: PaymentStatus;
  externalId?: string;
  rawData?: Record<string, unknown>;
}

export interface GatewayCredentials {
  accessToken?: string;
  publicKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  [key: string]: string | undefined;
}
