import { NextRequest } from "next/server";
import { successResponse, handleApiError, requireAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const [activeRaffles, totalUsers, pendingOrders, totalRevenue] =
      await Promise.all([
        prisma.raffle
          .count({ where: { status: "ACTIVE" } })
          .catch(() => 0),
        prisma.user
          .count()
          .catch(() => 0),
        prisma.order
          .count({ where: { status: "PENDING" } })
          .catch(() => 0),
        prisma.payment
          .aggregate({
            where: { status: "APPROVED" },
            _sum: { amount: true },
          })
          .then((r) => Number(r._sum.amount || 0))
          .catch(() => 0),
      ]);

    return successResponse({
      activeRaffles,
      totalUsers,
      pendingOrders,
      totalRevenue,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
