import { successResponse, handleApiError, requireAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400 * 1000);

    const [
      activeRaffles,
      totalUsers,
      pendingOrders,
      confirmedOrdersSum,
      recentOrders,
      recentDraws,
      dailyOrders,
      usersThisWeek,
      rafflesClosed,
    ] = await Promise.all([
      // Active raffles
      prisma.raffle.count({ where: { status: "ACTIVE" } }).catch(() => 0),

      // Total users
      prisma.user.count().catch(() => 0),

      // Pending orders
      prisma.order.count({ where: { status: "PENDING" } }).catch(() => 0),

      // Total revenue: sum of CONFIRMED orders (in AHC) — represents ticket purchases
      prisma.order
        .aggregate({
          where: { status: "CONFIRMED" },
          _sum: { finalAmount: true },
        })
        .then((r) => Number(r._sum.finalAmount || 0))
        .catch(() => 0),

      // 10 most recent orders with user + raffle
      prisma.order
        .findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: { select: { name: true, email: true, avatarUrl: true } },
            items: {
              take: 1,
              include: { raffle: { select: { title: true, slug: true } } },
            },
          },
        })
        .catch(() => []),

      // 5 most recent draws
      prisma.raffleDraw
        .findMany({
          orderBy: { drawnAt: "desc" },
          take: 5,
          include: {
            raffle: { select: { title: true, slug: true } },
            winner: { select: { userId: true, numberWon: true } },
          },
        })
        .catch(() => []),

      // Daily orders last 30 days (for the chart)
      prisma.$queryRaw<Array<{ day: Date; revenue: number; count: bigint }>>`
        SELECT
          DATE_TRUNC('day', "createdAt") AS day,
          COALESCE(SUM("finalAmount"), 0)::float AS revenue,
          COUNT(*)::bigint AS count
        FROM "orders"
        WHERE "status" = 'CONFIRMED'
          AND "createdAt" >= ${thirtyDaysAgo}
        GROUP BY day
        ORDER BY day ASC
      `.catch(() => []),

      // New users this week
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }).catch(() => 0),

      // Raffles closed (awaiting draw)
      prisma.raffle.count({ where: { status: "CLOSED" } }).catch(() => 0),
    ]);

    // Build full 30-day series (fill missing days with 0)
    const revenueByDay: { date: string; revenue: number; count: number }[] = [];
    const dailyMap = new Map(
      (dailyOrders as any[]).map((r) => [
        new Date(r.day).toISOString().split("T")[0],
        { revenue: Number(r.revenue), count: Number(r.count) },
      ])
    );
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400 * 1000);
      const key = d.toISOString().split("T")[0];
      const entry = dailyMap.get(key) ?? { revenue: 0, count: 0 };
      revenueByDay.push({ date: key, ...entry });
    }

    return successResponse({
      stats: {
        activeRaffles,
        totalUsers,
        pendingOrders,
        totalRevenue: confirmedOrdersSum,
        usersThisWeek,
        rafflesClosed,
      },
      revenueByDay,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        status: o.status,
        finalAmount: Number(o.finalAmount),
        createdAt: o.createdAt,
        user: o.user,
        raffleTitle: o.items[0]?.raffle?.title ?? null,
        raffleSlug: o.items[0]?.raffle?.slug ?? null,
      })),
      recentDraws: recentDraws.map((d) => ({
        id: d.id,
        drawnAt: d.drawnAt,
        winningNumber: d.winningNumber,
        raffleTitle: d.raffle?.title ?? null,
        raffleSlug: d.raffle?.slug ?? null,
        hasWinner: Boolean(d.winner),
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
