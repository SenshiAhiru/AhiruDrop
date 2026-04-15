import { NextRequest } from "next/server";
import { successResponse, handleApiError, requireAuth } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

/**
 * Returns all raffles the authenticated user has won.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();

    const winners = await prisma.winner.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        draw: {
          include: {
            raffle: {
              select: {
                id: true,
                title: true,
                slug: true,
                skinImage: true,
                skinRarity: true,
                skinRarityColor: true,
                skinWear: true,
                skinWeapon: true,
                skinMarketPrice: true,
                totalNumbers: true,
                pricePerNumber: true,
              },
            },
          },
        },
      },
    });

    const data = winners.map((w) => ({
      id: w.id,
      numberWon: w.numberWon,
      claimedAt: w.claimedAt,
      createdAt: w.createdAt,
      drawnAt: w.draw.drawnAt,
      raffle: w.draw.raffle
        ? {
            ...w.draw.raffle,
            pricePerNumber: Number(w.draw.raffle.pricePerNumber),
            skinMarketPrice: w.draw.raffle.skinMarketPrice
              ? Number(w.draw.raffle.skinMarketPrice)
              : null,
          }
        : null,
    }));

    return successResponse({ data, total: data.length });
  } catch (error) {
    return handleApiError(error);
  }
}
