import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ couponId: string }> }
) {
  try {
    await requireAdmin();
    const { couponId } = await params;
    const { searchParams } = req.nextUrl;

    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "50")));

    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });
    if (!coupon) return errorResponse("Cupom não encontrado", 404);

    const [rows, total, bonusAgg] = await Promise.all([
      prisma.couponRedemption.findMany({
        where: { couponId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.couponRedemption.count({ where: { couponId } }),
      prisma.couponRedemption.aggregate({
        where: { couponId },
        _sum: { bonusAhc: true },
      }),
    ]);

    // Enrich with user info + optional deposit context
    const userIds = [...new Set(rows.map((r) => r.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    const refIds = rows
      .map((r) => r.referenceId)
      .filter((x): x is string => Boolean(x));
    const deposits = refIds.length
      ? await prisma.deposit.findMany({
          where: { paymentIntentId: { in: refIds } },
          select: {
            paymentIntentId: true,
            ahcTotal: true,
            amountPaid: true,
            currency: true,
            status: true,
          },
        })
      : [];
    const depositMap = Object.fromEntries(
      deposits.map((d) => [d.paymentIntentId, d])
    );

    const data = rows.map((r) => {
      const deposit = r.referenceId ? depositMap[r.referenceId] : null;
      return {
        id: r.id,
        userId: r.userId,
        userName: userMap[r.userId]?.name ?? "Usuário removido",
        userEmail: userMap[r.userId]?.email ?? null,
        context: r.context,
        referenceId: r.referenceId,
        createdAt: r.createdAt,
        bonusAhc: Number(r.bonusAhc),
        ahcTotal: deposit ? Number(deposit.ahcTotal) : null,
        amountPaid: deposit ? Number(deposit.amountPaid) : null,
        currency: deposit?.currency ?? null,
        depositStatus: deposit?.status ?? null,
      };
    });

    return successResponse({
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        maxUses: coupon.maxUses,
        maxUsesPerUser: coupon.maxUsesPerUser,
        currentUses: coupon.currentUses,
        isActive: coupon.isActive,
      },
      data,
      total,
      pages: Math.ceil(total / limit),
      page,
      totalBonusGranted: Number(bonusAgg._sum.bonusAhc ?? 0),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
