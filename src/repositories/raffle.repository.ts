import { prisma } from "@/lib/prisma";
import { Prisma, RaffleStatus } from "@prisma/client";

export const raffleRepository = {
  async findById(id: string) {
    return prisma.raffle.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
  },

  async findBySlug(slug: string) {
    return prisma.raffle.findUnique({
      where: { slug },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
  },

  async findMany(params: {
    status?: RaffleStatus;
    statuses?: RaffleStatus[];
    isFeatured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, statuses, isFeatured, search, page = 1, limit = 12 } = params;
    const where: Prisma.RaffleWhereInput = {};

    if (statuses && statuses.length > 0) {
      where.status = { in: statuses };
    } else if (status) {
      where.status = status;
    }
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.raffle.findMany({
        where,
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
        // ACTIVE first, CLOSED next, DRAWN last — then most recent within each
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.raffle.count({ where }),
    ]);

    return { data, total, pages: Math.ceil(total / limit) };
  },

  async create(data: Prisma.RaffleCreateInput) {
    return prisma.raffle.create({ data });
  },

  async update(id: string, data: Prisma.RaffleUpdateInput) {
    return prisma.raffle.update({ where: { id }, data });
  },

  async delete(id: string) {
    // Delete related records first to avoid FK constraints
    await prisma.raffleNumber.deleteMany({ where: { raffleId: id } });
    await prisma.raffleImage.deleteMany({ where: { raffleId: id } });
    await prisma.orderItem.deleteMany({ where: { raffleId: id } });
    return prisma.raffle.delete({ where: { id } });
  },

  async getStats(id: string) {
    const counts = await prisma.raffleNumber.groupBy({
      by: ["status"],
      where: { raffleId: id },
      _count: true,
    });

    const stats = { available: 0, reserved: 0, paid: 0, total: 0 };
    for (const c of counts) {
      stats[c.status.toLowerCase() as keyof typeof stats] = c._count;
      stats.total += c._count;
    }
    return stats;
  },

  /**
   * Batched version of getStats — single groupBy across many raffles.
   * Use when listing multiple raffles to avoid N+1 query patterns.
   */
  async getStatsBatch(ids: string[]) {
    type Stats = { available: number; reserved: number; paid: number; total: number };
    const out = new Map<string, Stats>();
    for (const id of ids) {
      out.set(id, { available: 0, reserved: 0, paid: 0, total: 0 });
    }
    if (ids.length === 0) return out;

    const counts = await prisma.raffleNumber.groupBy({
      by: ["raffleId", "status"],
      where: { raffleId: { in: ids } },
      _count: true,
    });

    for (const c of counts) {
      const s = out.get(c.raffleId);
      if (!s) continue;
      s[c.status.toLowerCase() as keyof Stats] = c._count;
      s.total += c._count;
    }
    return out;
  },

  async countByStatus() {
    return prisma.raffle.groupBy({
      by: ["status"],
      _count: true,
    });
  },
};
