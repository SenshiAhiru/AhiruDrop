import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

/**
 * Full user dossier for admin: profile + orders + wins + recent activity.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin();
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        steamId: true,
        role: true,
        avatarUrl: true,
        balance: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return errorResponse("Usuário não encontrado", 404);

    const [orders, winners, spending, notificationsCount] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          status: true,
          totalAmount: true,
          finalAmount: true,
          discount: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              quantity: true,
              pricePerNumber: true,
              subtotal: true,
              raffle: { select: { id: true, title: true, slug: true, skinImage: true } },
            },
          },
        },
      }),
      prisma.winner.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          draw: {
            include: {
              raffle: { select: { id: true, title: true, slug: true, skinImage: true } },
            },
          },
        },
      }),
      prisma.order.groupBy({
        by: ["status"],
        where: { userId },
        _sum: { finalAmount: true },
        _count: true,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    const totalsByStatus = Object.fromEntries(
      spending.map((s) => [
        s.status,
        { count: s._count, sum: Number(s._sum.finalAmount || 0) },
      ])
    );

    return successResponse({
      user: {
        ...user,
        balance: Number(user.balance),
      },
      stats: {
        orderCount: orders.length,
        winCount: winners.length,
        notificationCount: notificationsCount,
        confirmedSpent: totalsByStatus["CONFIRMED"]?.sum ?? 0,
        confirmedOrders: totalsByStatus["CONFIRMED"]?.count ?? 0,
        pendingOrders: totalsByStatus["PENDING"]?.count ?? 0,
        cancelledOrders: totalsByStatus["CANCELLED"]?.count ?? 0,
      },
      orders: orders.map((o) => ({
        ...o,
        totalAmount: Number(o.totalAmount),
        finalAmount: Number(o.finalAmount),
        discount: Number(o.discount),
        items: o.items.map((i) => ({
          ...i,
          pricePerNumber: Number(i.pricePerNumber),
          subtotal: Number(i.subtotal),
        })),
      })),
      winnings: winners.map((w) => ({
        id: w.id,
        numberWon: w.numberWon,
        claimedAt: w.claimedAt,
        createdAt: w.createdAt,
        drawnAt: w.draw.drawnAt,
        raffle: w.draw.raffle,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
