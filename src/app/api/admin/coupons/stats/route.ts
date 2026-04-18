import { successResponse, handleApiError, requireAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalCoupons, activeCoupons, totalRedemptions, redemptionsLast30d, bonusSum, topCoupons] = await Promise.all([
      prisma.coupon.count(),
      prisma.coupon.count({
        where: {
          isActive: true,
          OR: [{ validUntil: null }, { validUntil: { gt: now } }],
        },
      }),
      prisma.couponRedemption.count(),
      prisma.couponRedemption.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.deposit.aggregate({
        where: { status: "COMPLETED", ahcBonus: { gt: 0 } },
        _sum: { ahcBonus: true },
      }),
      prisma.couponRedemption.groupBy({
        by: ["couponId"],
        _count: { couponId: true },
        orderBy: { _count: { couponId: "desc" } },
        take: 5,
      }),
    ]);

    const topCouponIds = topCoupons.map((t) => t.couponId);
    const topCouponDocs = topCouponIds.length
      ? await prisma.coupon.findMany({
          where: { id: { in: topCouponIds } },
          select: { id: true, code: true },
        })
      : [];
    const topCouponMap = Object.fromEntries(topCouponDocs.map((c) => [c.id, c.code]));

    return successResponse({
      totalCoupons,
      activeCoupons,
      totalRedemptions,
      redemptionsLast30d,
      totalBonusGranted: Number(bonusSum._sum.ahcBonus ?? 0),
      topCoupons: topCoupons.map((t) => ({
        couponId: t.couponId,
        code: topCouponMap[t.couponId] ?? "?",
        uses: t._count.couponId,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
