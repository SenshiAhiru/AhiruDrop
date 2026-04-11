import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const couponService = {
  async validate(code: string, orderAmount: number) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new Error("Cupom nao encontrado");
    }

    if (!coupon.isActive) {
      throw new Error("Este cupom esta inativo");
    }

    // Check expiration
    const now = new Date();
    if (coupon.validFrom > now) {
      throw new Error("Este cupom ainda nao esta valido");
    }
    if (coupon.validUntil && coupon.validUntil < now) {
      throw new Error("Este cupom expirou");
    }

    // Check max uses
    if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
      throw new Error("Este cupom atingiu o limite de utilizacoes");
    }

    // Check minimum order amount
    if (
      coupon.minOrderAmount !== null &&
      orderAmount < Number(coupon.minOrderAmount)
    ) {
      throw new Error(
        `Valor minimo do pedido para este cupom: R$ ${Number(coupon.minOrderAmount).toFixed(2)}`
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
      throw new Error("Ja existe um cupom com este codigo");
    }

    return prisma.coupon.create({
      data: {
        code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxUses: data.maxUses,
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
      minOrderAmount?: number | null;
      validFrom?: Date;
      validUntil?: Date | null;
      isActive?: boolean;
    }
  ) {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new Error("Cupom nao encontrado");

    // Check code uniqueness if changing
    if (data.code && data.code.toUpperCase() !== coupon.code) {
      const existing = await prisma.coupon.findUnique({
        where: { code: data.code.toUpperCase() },
      });
      if (existing) {
        throw new Error("Ja existe um cupom com este codigo");
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

  async delete(id: string) {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new Error("Cupom nao encontrado");

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
