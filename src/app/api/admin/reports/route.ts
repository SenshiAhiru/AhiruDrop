import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAdmin,
} from "@/lib/api-utils";
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

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return errorResponse("Datas invalidas", 422);
    }

    const dateFilter = {
      gte: fromDate,
      lte: toDate,
    };

    switch (type) {
      case "revenue": {
        const revenue = await prisma.payment
          .aggregate({
            where: {
              status: "APPROVED",
              paidAt: dateFilter,
            },
            _sum: { amount: true },
            _count: true,
          })
          .catch(() => ({ _sum: { amount: 0 }, _count: 0 }));

        return successResponse({
          type: "revenue",
          period: { from, to },
          totalRevenue: Number(revenue._sum.amount || 0),
          totalPayments: revenue._count,
        });
      }

      case "orders": {
        const [pending, confirmed, cancelled, expired] = await Promise.all([
          prisma.order.count({ where: { status: "PENDING", createdAt: dateFilter } }).catch(() => 0),
          prisma.order.count({ where: { status: "CONFIRMED", createdAt: dateFilter } }).catch(() => 0),
          prisma.order.count({ where: { status: "CANCELLED", createdAt: dateFilter } }).catch(() => 0),
          prisma.order.count({ where: { status: "EXPIRED", createdAt: dateFilter } }).catch(() => 0),
        ]);

        return successResponse({
          type: "orders",
          period: { from, to },
          byStatus: { pending, confirmed, cancelled, expired },
          total: pending + confirmed + cancelled + expired,
        });
      }

      case "top-raffles": {
        const topRaffles = await prisma.orderItem
          .groupBy({
            by: ["raffleId"],
            where: {
              order: {
                status: "CONFIRMED",
                createdAt: dateFilter,
              },
            },
            _sum: { subtotal: true, quantity: true },
            _count: true,
            orderBy: { _sum: { subtotal: "desc" } },
            take: 10,
          })
          .catch(() => []);

        // Enrich with raffle titles
        const raffleIds = topRaffles.map((r) => r.raffleId);
        const raffles = await prisma.raffle.findMany({
          where: { id: { in: raffleIds } },
          select: { id: true, title: true, slug: true },
        });

        const raffleMap = new Map(raffles.map((r) => [r.id, r]));

        const enriched = topRaffles.map((item) => ({
          raffleId: item.raffleId,
          title: raffleMap.get(item.raffleId)?.title || "Desconhecida",
          slug: raffleMap.get(item.raffleId)?.slug,
          totalRevenue: Number(item._sum.subtotal || 0),
          totalNumbers: Number(item._sum.quantity || 0),
          totalOrders: item._count,
        }));

        return successResponse({
          type: "top-raffles",
          period: { from, to },
          data: enriched,
        });
      }

      case "summary":
      default: {
        const [revenue, orderCount, userCount, raffleCount] = await Promise.all([
          prisma.payment
            .aggregate({
              where: { status: "APPROVED", paidAt: dateFilter },
              _sum: { amount: true },
            })
            .then((r) => Number(r._sum.amount || 0))
            .catch(() => 0),
          prisma.order
            .count({ where: { createdAt: dateFilter } })
            .catch(() => 0),
          prisma.user
            .count({ where: { createdAt: dateFilter } })
            .catch(() => 0),
          prisma.raffle
            .count({ where: { createdAt: dateFilter } })
            .catch(() => 0),
        ]);

        return successResponse({
          type: "summary",
          period: { from, to },
          revenue,
          orders: orderCount,
          newUsers: userCount,
          newRaffles: raffleCount,
        });
      }
    }
  } catch (error) {
    return handleApiError(error);
  }
}
