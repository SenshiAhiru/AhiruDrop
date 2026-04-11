import { prisma } from "@/lib/prisma";
import { NotificationType, Prisma } from "@prisma/client";

export const notificationRepository = {
  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Prisma.JsonValue;
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data ?? undefined,
      },
    });
  },

  async findByUser(
    userId: string,
    params: { page?: number; limit?: number; unreadOnly?: boolean }
  ) {
    const { page = 1, limit = 20, unreadOnly } = params;
    const where: Prisma.NotificationWhereInput = { userId };

    if (unreadOnly) where.readAt = null;

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
};
