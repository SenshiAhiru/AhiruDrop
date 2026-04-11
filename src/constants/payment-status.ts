export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
  REFUNDED: "REFUNDED",
  CANCELLED: "CANCELLED",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const NUMBER_STATUS = {
  AVAILABLE: "AVAILABLE",
  RESERVED: "RESERVED",
  PAID: "PAID",
} as const;

export type NumberStatus =
  (typeof NUMBER_STATUS)[keyof typeof NUMBER_STATUS];

export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;

export type OrderStatus =
  (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
