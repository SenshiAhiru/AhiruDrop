import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, getSession } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ raffleId: string }> }
) {
  try {
    const { raffleId } = await params;
    const session = await getSession();
    const currentUserId = session?.user?.id ?? null;

    const numbers = await prisma.raffleNumber.findMany({
      where: { raffleId },
      select: {
        number: true,
        status: true,
        orderId: true,
      },
      orderBy: { number: "asc" },
    });

    if (!numbers) {
      return errorResponse("Rifa não encontrada", 404);
    }

    // If user is logged in, find their order IDs for this raffle
    let myOrderIds = new Set<string>();
    if (currentUserId) {
      const myOrders = await prisma.order.findMany({
        where: {
          userId: currentUserId,
          status: "CONFIRMED",
          items: { some: { raffleId } },
        },
        select: { id: true },
      });
      myOrderIds = new Set(myOrders.map((o) => o.id));
    }

    const mapped = numbers.map((n) => ({
      number: n.number,
      status: n.status,
      mine: n.orderId ? myOrderIds.has(n.orderId) : false,
    }));

    return successResponse(mapped);
  } catch (error) {
    return handleApiError(error);
  }
}
