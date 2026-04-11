import { prisma } from "@/lib/prisma";
import { PaymentStatus, Prisma } from "@prisma/client";

export const paymentRepository = {
  async create(data: {
    orderId: string;
    gatewayId: string;
    amount: number;
    method?: string;
    expiresAt?: Date;
  }) {
    return prisma.payment.create({
      data: {
        orderId: data.orderId,
        gatewayId: data.gatewayId,
        amount: Number(data.amount),
        method: data.method,
        expiresAt: data.expiresAt,
      },
    });
  },

  async findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        order: true,
        gateway: true,
        logs: { orderBy: { createdAt: "desc" } },
      },
    });
  },

  async findByExternalId(externalId: string) {
    return prisma.payment.findFirst({
      where: { externalId },
      include: { order: true, gateway: true },
    });
  },

  async findByOrder(orderId: string) {
    return prisma.payment.findMany({
      where: { orderId },
      include: { gateway: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async updateStatus(
    id: string,
    data: {
      status: PaymentStatus;
      externalId?: string;
      paidAt?: Date;
      gatewayResponse?: Prisma.JsonValue;
    }
  ) {
    return prisma.payment.update({
      where: { id },
      data: {
        status: data.status,
        externalId: data.externalId,
        paidAt: data.paidAt,
        gatewayResponse: data.gatewayResponse ?? undefined,
      },
    });
  },

  async findMany(params: {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
    gatewayId?: string;
  }) {
    const { page = 1, limit = 20, status, gatewayId } = params;
    const where: Prisma.PaymentWhereInput = {};

    if (status) where.status = status;
    if (gatewayId) where.gatewayId = gatewayId;

    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          order: { select: { id: true, userId: true, status: true } },
          gateway: { select: { id: true, name: true, displayName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    return { data, total, pages: Math.ceil(total / limit) };
  },

  async createLog(paymentId: string, event: string, data: Prisma.JsonValue) {
    return prisma.paymentLog.create({
      data: {
        paymentId,
        event,
        data,
      },
    });
  },
};
