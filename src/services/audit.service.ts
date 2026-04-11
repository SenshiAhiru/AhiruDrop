import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const auditService = {
  async log(
    actorId: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata?: Record<string, any>,
    ipAddress?: string
  ) {
    return prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        metadata: metadata ?? undefined,
        ipAddress,
      },
    });
  },

  async list(params: {
    page?: number;
    limit?: number;
    actorId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
  }) {
    const { page = 1, limit = 50, actorId, action, entityType, entityId } =
      params;
    const where: Prisma.AuditLogWhereInput = {};

    if (actorId) where.actorId = actorId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { data, total, pages: Math.ceil(total / limit) };
  },
};
