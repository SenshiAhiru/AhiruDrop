import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const auditRepository = {
  async create(data: {
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Prisma.JsonValue;
    ipAddress?: string;
  }) {
    return prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: data.metadata ?? undefined,
        ipAddress: data.ipAddress,
      },
    });
  },

  async findMany(params: {
    page?: number;
    limit?: number;
    entityType?: string;
    entityId?: string;
    actorId?: string;
  }) {
    const { page = 1, limit = 50, entityType, entityId, actorId } = params;
    const where: Prisma.AuditLogWhereInput = {};

    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (actorId) where.actorId = actorId;

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
