import { prisma } from "@/lib/prisma";
import { NotificationType, Prisma } from "@prisma/client";

export const notificationService = {
  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>
  ) {
    return prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data ?? undefined,
      },
    });
  },

  async getByUser(
    userId: string,
    params: { page?: number; limit?: number; unreadOnly?: boolean }
  ) {
    const { page = 1, limit = 20, unreadOnly } = params;
    const where: Prisma.NotificationWhereInput = { userId };

    if (unreadOnly) {
      where.readAt = null;
    }

    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return { data, total, pages: Math.ceil(total / limit) };
  },

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  },

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  },

  async countUnread(userId: string) {
    return prisma.notification.count({
      where: { userId, readAt: null },
    });
  },

  async notifyWinner(userId: string, raffleTitle: string, number: number) {
    return this.create(
      userId,
      "WINNER_NOTIFICATION",
      "Parabéns! Você ganhou!",
      `Você foi sorteado na rifa "${raffleTitle}" com o número ${number}! Entre em contato para retirar seu prêmio.`,
      { raffleTitle, number }
    );
  },

  async notifyPaymentReceived(
    userId: string,
    orderId: string,
    amount: number
  ) {
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);

    return this.create(
      userId,
      "PAYMENT_RECEIVED",
      "Pagamento recebido",
      `Seu pagamento de ${formatted} para o pedido #${orderId.slice(0, 8)} foi confirmado.`,
      { orderId, amount }
    );
  },

  async notifyOrderConfirmed(userId: string, orderId: string) {
    return this.create(
      userId,
      "ORDER_CONFIRMED",
      "Pedido confirmado",
      `Seu pedido #${orderId.slice(0, 8)} foi confirmado! Seus números estão garantidos. Boa sorte!`,
      { orderId }
    );
  },
};
