import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;

    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const type = searchParams.get("type") || "summary";

    if (!from || !to) {
      return errorResponse("Parâmetros 'from' e 'to' são obrigatórios", 422);
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999); // include the whole "to" day

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return errorResponse("Datas invalidas", 422);
    }

    const dateFilter = { gte: fromDate, lte: toDate };

    switch (type) {
      // ─── Summary stats + revenue per day (main dashboard query) ───
      case "summary": {
        const [revenueAgg, totalOrders, newUsers, newRaffles, revenueByDay, topRaffles] = await Promise.all([
          prisma.order
            .aggregate({
              where: { status: "CONFIRMED", createdAt: dateFilter },
              _sum: { finalAmount: true },
              _count: true,
            })
            .catch(() => ({ _sum: { finalAmount: 0 }, _count: 0 })),

          prisma.order.count({ where: { createdAt: dateFilter } }).catch(() => 0),

          prisma.user.count({ where: { createdAt: dateFilter } }).catch(() => 0),

          prisma.raffle.count({ where: { createdAt: dateFilter } }).catch(() => 0),

          prisma.$queryRaw<Array<{ day: Date; revenue: number; count: bigint }>>`
            SELECT
              DATE_TRUNC('day', "createdAt") AS day,
              COALESCE(SUM("finalAmount"), 0)::float AS revenue,
              COUNT(*)::bigint AS count
            FROM "orders"
            WHERE "status" = 'CONFIRMED'
              AND "createdAt" >= ${fromDate}
              AND "createdAt" <= ${toDate}
            GROUP BY day
            ORDER BY day ASC
          `.catch(() => []),

          prisma.orderItem
            .groupBy({
              by: ["raffleId"],
              where: {
                order: { status: "CONFIRMED", createdAt: dateFilter },
              },
              _sum: { subtotal: true, quantity: true },
              _count: true,
              orderBy: { _sum: { subtotal: "desc" } },
              take: 10,
            })
            .catch(() => [] as any[]),
        ]);

        // Enrich top raffles with titles
        const raffleIds = (topRaffles as any[]).map((r) => r.raffleId);
        const raffles =
          raffleIds.length > 0
            ? await prisma.raffle.findMany({
                where: { id: { in: raffleIds } },
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  skinImage: true,
                  skinRarityColor: true,
                  totalNumbers: true,
                },
              })
            : [];
        const raffleMap = new Map(raffles.map((r) => [r.id, r]));

        const enrichedTop = (topRaffles as any[]).map((item) => {
          const r = raffleMap.get(item.raffleId);
          return {
            raffleId: item.raffleId,
            title: r?.title ?? "Desconhecida",
            slug: r?.slug ?? null,
            skinImage: r?.skinImage ?? null,
            skinRarityColor: r?.skinRarityColor ?? null,
            totalNumbers: r?.totalNumbers ?? 0,
            soldNumbers: Number(item._sum.quantity || 0),
            totalRevenue: Number(item._sum.subtotal || 0),
            totalOrders: item._count,
          };
        });

        // Build full daily series including gaps
        const dailyMap = new Map(
          (revenueByDay as any[]).map((r) => [
            new Date(r.day).toISOString().split("T")[0],
            { revenue: Number(r.revenue), count: Number(r.count) },
          ])
        );
        const daysDiff = Math.max(
          1,
          Math.ceil((toDate.getTime() - fromDate.getTime()) / 86400000) + 1
        );
        const series: { date: string; revenue: number; count: number }[] = [];
        for (let i = 0; i < daysDiff; i++) {
          const d = new Date(fromDate.getTime() + i * 86400 * 1000);
          const key = d.toISOString().split("T")[0];
          const entry = dailyMap.get(key) ?? { revenue: 0, count: 0 };
          series.push({ date: key, ...entry });
        }

        const revenue = Number(revenueAgg._sum.finalAmount || 0);
        const confirmedCount = revenueAgg._count;
        const avgTicket = confirmedCount > 0 ? revenue / confirmedCount : 0;

        return successResponse({
          period: { from, to },
          stats: {
            revenue,
            totalOrders,
            confirmedOrders: confirmedCount,
            newUsers,
            newRaffles,
            avgTicket,
          },
          revenueByDay: series,
          topRaffles: enrichedTop,
        });
      }

      default:
        return errorResponse(`Type '${type}' não suportado`, 422);
    }
  } catch (error) {
    return handleApiError(error);
  }
}
