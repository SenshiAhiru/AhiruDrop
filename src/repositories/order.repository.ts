import { prisma } from "@/lib/prisma";
import { OrderStatus, Prisma } from "@prisma/client";

export const orderRepository = {
  async create(data: {
    userId: string;
    totalAmount: number;
    discount: number;
    finalAmount: number;
    couponId?: string;
    expiresAt: Date;
    items: {
      raffleId: string;
      quantity: number;
      pricePerNumber: number;
      subtotal: number;
    }[];
  }) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: data.userId,
          totalAmount: Number(data.totalAmount),
          discount: Number(data.discount),
          finalAmount: Number(data.finalAmount),
          couponId: data.couponId,
          expiresAt: data.expiresAt,
          items: {
            create: data.items.map((item) => ({
              raffleId: item.raffleId,
              quantity: item.quantity,
              pricePerNumber: Number(item.pricePerNumber),
              subtotal: Number(item.subtotal),
            })),
          },
        },
        include: { items: true },
      });

      return order;
    });
  },

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { raffle: true } },
        payments: true,
        numbers: true,
      },
    });
  },

  async findByUser(
    userId: string,
    params: { page?: number; limit?: number; status?: OrderStatus }
  ) {
    const { page = 1, limit = 10, status } = params;
    const where: Prisma.OrderWhereInput = { userId };

    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: { include: { raffle: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return { data, total, pages: Math.ceil(total / limit) };
  },

  async findMany(params: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    search?: string;
  }) {
    const { page = 1, limit = 20, status, search } = params;
    const where: Prisma.OrderWhereInput = {};

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { id: { contains: search } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { include: { raffle: { select: { id: true, title: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return { data, total, pages: Math.ceil(total / limit) };
  },

  async updateStatus(id: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id },
      data: { status },
    });
  },

  async countPending() {
    return prisma.order.count({
      where: { status: OrderStatus.PENDING },
    });
  },
};
