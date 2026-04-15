import { prisma } from "@/lib/prisma";
import { NotificationType, Prisma } from "@prisma/client";
import { ADMIN_ROLES } from "@/constants/roles";

async function getAdminIds(): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { role: { in: ADMIN_ROLES as any }, isActive: true },
    select: { id: true },
  });
  return admins.map((a) => a.id);
}

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

  /**
   * Fan-out: creates the same notification for every active admin user.
   * Safe no-op if there are no admins.
   */
  async sendToAdmins(
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>,
    opts?: { excludeUserId?: string }
  ) {
    const ids = await getAdminIds();
    const targets = opts?.excludeUserId
      ? ids.filter((id) => id !== opts.excludeUserId)
      : ids;
    if (targets.length === 0) return { count: 0 };

    return prisma.notification.createMany({
      data: targets.map((userId) => ({
        userId,
        type,
        title,
        message,
        data: (data as Prisma.InputJsonValue) ?? undefined,
      })),
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

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
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

  // ─── User-facing helpers ───
  async notifyWinner(userId: string, raffleTitle: string, number: number) {
    return this.create(
      userId,
      "WINNER_NOTIFICATION",
      "Parabéns! Você ganhou!",
      `Você foi sorteado na rifa "${raffleTitle}" com o número ${number}!`,
      { raffleTitle, number }
    );
  },

  async notifyPaymentReceived(userId: string, orderId: string, amount: number) {
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
    return this.create(
      userId,
      "PAYMENT_RECEIVED",
      "Pagamento recebido",
      `Seu pagamento de ${formatted} para o pedido #${orderId.slice(0, 8)} foi confirmado.`,
      { orderId, amount, link: `/dashboard/orders` }
    );
  },

  async notifyOrderConfirmed(userId: string, orderId: string) {
    return this.create(
      userId,
      "ORDER_CONFIRMED",
      "Pedido confirmado",
      `Seu pedido #${orderId.slice(0, 8)} foi confirmado! Seus números estão garantidos. Boa sorte!`,
      { orderId, link: `/dashboard/orders` }
    );
  },

  async notifySupportReply(userId: string, ticketId: string, subject: string, preview: string) {
    return this.create(
      userId,
      "SUPPORT_NEW_MESSAGE",
      "Nova resposta do suporte",
      `Suporte respondeu no ticket "${subject}": ${preview.slice(0, 100)}${preview.length > 100 ? "…" : ""}`,
      { ticketId, link: `/dashboard/support/${ticketId}` }
    );
  },

  // ─── Admin-facing helpers ───
  async notifyAdminsNewTicket(ticketId: string, userName: string, subject: string) {
    return this.sendToAdmins(
      "SUPPORT_NEW_TICKET",
      "Novo ticket de suporte",
      `${userName} abriu um ticket: "${subject}"`,
      { ticketId, link: `/admin/support/${ticketId}` }
    );
  },

  async notifyAdminsNewMessage(
    ticketId: string,
    userName: string,
    subject: string,
    preview: string
  ) {
    return this.sendToAdmins(
      "SUPPORT_NEW_MESSAGE",
      "Nova mensagem no suporte",
      `${userName} respondeu em "${subject}": ${preview.slice(0, 100)}${preview.length > 100 ? "…" : ""}`,
      { ticketId, link: `/admin/support/${ticketId}` }
    );
  },

  async notifyAdminsRaffleReadyToDraw(raffleId: string, raffleTitle: string, slug: string) {
    return this.sendToAdmins(
      "RAFFLE_READY_TO_DRAW",
      "Rifa pronta para sorteio",
      `A rifa "${raffleTitle}" foi encerrada e já pode ser sorteada.`,
      { raffleId, slug, link: `/admin/raffles/${raffleId}/draw` }
    );
  },

  async notifyAdminsBigDeposit(userId: string, userName: string, amount: number) {
    return this.sendToAdmins(
      "BIG_DEPOSIT",
      "Depósito relevante",
      `${userName} depositou ${amount.toFixed(2)} AHC.`,
      { userId, amount, link: `/admin/users/${userId}` }
    );
  },
};
