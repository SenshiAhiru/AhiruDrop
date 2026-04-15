import { NextRequest } from "next/server";
import { successResponse, handleApiError, requireAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

/**
 * Returns count + list of unique participants for a raffle.
 * A participant is a user who owns at least one PAID number in this raffle.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ raffleId: string }> }
) {
  try {
    await requireAdmin();
    const { raffleId } = await params;

    // Get all paid numbers for the raffle, group by order → user
    const paidNumbers = await prisma.raffleNumber.findMany({
      where: { raffleId, status: "PAID" },
      select: { orderId: true, number: true },
    });

    const orderIds = Array.from(
      new Set(paidNumbers.map((n) => n.orderId).filter((v): v is string => Boolean(v)))
    );

    if (orderIds.length === 0) {
      return successResponse({ count: 0, participants: [] });
    }

    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      select: {
        id: true,
        userId: true,
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    // Aggregate by user
    const byUser = new Map<
      string,
      { userId: string; name: string; email: string; avatarUrl: string | null; ticketCount: number; numbers: number[] }
    >();

    for (const n of paidNumbers) {
      const order = orders.find((o) => o.id === n.orderId);
      if (!order) continue;
      const key = order.userId;
      const entry = byUser.get(key);
      if (entry) {
        entry.ticketCount += 1;
        entry.numbers.push(n.number);
      } else {
        byUser.set(key, {
          userId: order.user.id,
          name: order.user.name ?? "Anônimo",
          email: order.user.email,
          avatarUrl: order.user.avatarUrl ?? null,
          ticketCount: 1,
          numbers: [n.number],
        });
      }
    }

    const participants = Array.from(byUser.values())
      .map((p) => ({ ...p, numbers: p.numbers.sort((a, b) => a - b) }))
      .sort((a, b) => b.ticketCount - a.ticketCount);

    return successResponse({
      count: participants.length,
      totalTickets: paidNumbers.length,
      participants,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
