import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const couponRepository = {
  async findByCode(code: string) {
    return prisma.coupon.findUnique({
      where: { code, isActive: true },
    });
  },

  async findById(id: string) {
    return prisma.coupon.findUnique({
      where: { id },
    });
  },

  async findMany(params: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }) {
    const { page = 1, limit = 20, isActive } = params;
    const where: Prisma.CouponWhereInput = {};

    if (isActive !== undefined) where.isActive = isActive;

    const [data, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.coupon.count({ where }),
    ]);

    return { data, total, pages: Math.ceil(total / limit) };
  },

  async create(data: Prisma.CouponCreateInput) {
    return prisma.coupon.create({ data });
  },

  async update(id: string, data: Prisma.CouponUpdateInput) {
    return prisma.coupon.update({ where: { id }, data });
  },

  async incrementUses(id: string) {
    return prisma.coupon.update({
      where: { id },
      data: { currentUses: { increment: 1 } },
    });
  },

  async delete(id: string) {
    return prisma.coupon.delete({ where: { id } });
  },
};
