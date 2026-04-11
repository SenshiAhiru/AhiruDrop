// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> =
  T extends (...args: unknown[]) => Promise<infer R> ? R : never;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

// Re-export domain types
export type { LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput, SessionUser } from "./auth.types";
export type { RaffleWithStats, RaffleFilters, NumberSelection, CreateRaffleInput, UpdateRaffleInput } from "./raffle.types";
export type { CreateOrderInput, OrderWithDetails, OrderFilters, OrderItem, OrderPayment } from "./order.types";
export type { PaymentGatewayConfig, CreatePaymentInput, WebhookResult, GatewayCredentials } from "./payment.types";
