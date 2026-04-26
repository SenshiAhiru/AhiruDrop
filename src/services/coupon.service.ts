import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const couponService = {
  async validate(code: string, orderAmount: number, userId?: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new Error("Cupom não encontrado");
    }

    if (!coupon.isActive) {
      throw new Error("Este cupom está inativo");
    }

    // Check expiration
    const now = new Date();
    if (coupon.validFrom > now) {
      throw new Error("Este cupom ainda não está válido");
    }
    if (coupon.validUntil && coupon.validUntil < now) {
      throw new Error("Este cupom expirou");
    }

    // Check max uses (total)
    if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
      throw new Error("Este cupom atingiu o limite de utilizações");
    }

    // Check per-user limit
    if (coupon.maxUsesPerUser !== null && userId) {
      const userRedemptions = await prisma.couponRedemption.count({
        where: { couponId: coupon.id, userId },
      });
      if (userRedemptions >= coupon.maxUsesPerUser) {
        throw new Error(
          coupon.maxUsesPerUser === 1
            ? "Você já utilizou este cupom"
            : `Você já utilizou este cupom ${coupon.maxUsesPerUser}x (limite atingido)`
        );
      }
    }

    // Check minimum order amount
    if (
      coupon.minOrderAmount !== null &&
      orderAmount < Number(coupon.minOrderAmount)
    ) {
      throw new Error(
        `Valor mínimo do pedido para este cupom: R$ ${Number(coupon.minOrderAmount).toFixed(2)}`
      );
    }

    // Calculate discount
    let discount: number;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (orderAmount * Number(coupon.discountValue)) / 100;
    } else {
      // FIXED
      discount = Number(coupon.discountValue);
    }

    // Discount cannot exceed order amount
    discount = Math.min(discount, orderAmount);
    discount = Math.round(discount * 100) / 100;

    return { coupon, discount };
  },

  async create(data: {
    code: string;
    discountType: string;
    discountValue: number;
    maxUses?: number;
    maxUsesPerUser?: number;
    minOrderAmount?: number;
    validFrom?: Date;
    validUntil?: Date;
    isActive?: boolean;
  }) {
    // Normalize code to uppercase
    const code = data.code.toUpperCase();

    // Check uniqueness
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      throw new Error("Já existe um cupom com este código");
    }

    return prisma.coupon.create({
      data: {
        code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxUses: data.maxUses,
        maxUsesPerUser: data.maxUsesPerUser,
        minOrderAmount: data.minOrderAmount,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        isActive: data.isActive ?? true,
      },
    });
  },

  async update(
    id: string,
    data: {
      code?: string;
      discountType?: string;
      discountValue?: number;
      maxUses?: number | null;
      maxUsesPerUser?: number | null;
      minOrderAmount?: number | null;
      validFrom?: Date;
      validUntil?: Date | null;
      isActive?: boolean;
    }
  ) {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new Error("Cupom não encontrado");

    // Check code uniqueness if changing
    if (data.code && data.code.toUpperCase() !== coupon.code) {
      const existing = await prisma.coupon.findUnique({
        where: { code: data.code.toUpperCase() },
      });
      if (existing) {
        throw new Error("Já existe um cupom com este código");
      }
    }

    return prisma.coupon.update({
      where: { id },
      data: {
        ...data,
        code: data.code ? data.code.toUpperCase() : undefined,
      },
    });
  },

  /**
   * Atomically increments `currentUses` while enforcing maxUses at the DB
   * level. Returns whether the increment actually happened — losers in a
   * race-to-exhaustion (two parallel webhooks for the same coupon's last
   * slot) get `false`. Callers can then decide to absorb or refund.
   *
   * Using a raw UPDATE because Prisma can't compare two columns of the same
   * row in a single statement.
   */
  async incrementUseAtomic(couponId: string): Promise<{ ok: boolean }> {
    const affected = await prisma.$executeRaw`
      UPDATE "coupons"
      SET "currentUses" = "currentUses" + 1, "updatedAt" = NOW()
      WHERE "id" = ${couponId}
        AND ("maxUses" IS NULL OR "currentUses" < "maxUses")
    `;
    return { ok: affected === 1 };
  },

  async recordRedemption(params: {
    couponId: string;
    userId: string;
    context: "deposit" | "order";
    referenceId?: string;
    bonusAhc?: number;
  }) {
    return prisma.couponRedemption.create({
      data: {
        couponId: params.couponId,
        userId: params.userId,
        context: params.context,
        referenceId: params.referenceId,
        bonusAhc: params.bonusAhc ?? 0,
      },
    });
  },

  async delete(id: string) {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new Error("Cupom não encontrado");

    return prisma.coupon.delete({ where: { id } });
  },

  async listAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) {
    const { page = 1, limit = 20, search, isActive } = params;
    const where: Prisma.CouponWhereInput = {};

    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.code = { contains: search.toUpperCase() };
    }

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
};
