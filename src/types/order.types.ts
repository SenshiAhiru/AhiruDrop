import { OrderStatus } from "@/constants/payment-status";

export interface CreateOrderInput {
  raffleId: string;
  numbers: number[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  raffleId: string;
  number: number;
  priceAtPurchase: number;
}

export interface OrderPayment {
  id: string;
  orderId: string;
  gatewayName: string;
  externalId?: string;
  amount: number;
  status: string;
  method?: string;
  paidAt?: Date;
  createdAt: Date;
}

export interface OrderWithDetails {
  id: string;
  userId: string;
  raffleId: string;
  status: OrderStatus;
  totalAmount: number;
  couponId?: string;
  discountAmount?: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  payments: OrderPayment[];
  numbers: number[];
}

export interface OrderFilters {
  status?: OrderStatus;
  raffleId?: string;
  userId?: string;
  search?: string;
  page?: number;
  limit?: number;
  dateFrom?: Date;
  dateTo?: Date;
}
