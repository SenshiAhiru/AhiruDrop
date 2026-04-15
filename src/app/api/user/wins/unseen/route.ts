import { successResponse, handleApiError, requireAuth } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireAuth();

    const unseen = await prisma.winner.findMany({
      where: { userId: session.user.id, seenAt: null },
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
                skinName: true,
                skinRarity: true,
                skinRarityColor: true,
                skinWear: true,
                skinWeapon: true,
              },
            },
          },
        },
      },
    });

    const data = unseen.map((w) => ({
      id: w.id,
      numberWon: w.numberWon,
      drawnAt: w.draw.drawnAt,
      raffle: w.draw.raffle
        ? {
            id: w.draw.raffle.id,
            title: w.draw.raffle.title,
            slug: w.draw.raffle.slug,
            skinImage: w.draw.raffle.skinImage,
            skinName: w.draw.raffle.skinName,
            skinRarity: w.draw.raffle.skinRarity,
            skinRarityColor: w.draw.raffle.skinRarityColor,
            skinWear: w.draw.raffle.skinWear,
            skinWeapon: w.draw.raffle.skinWeapon,
          }
        : null,
    }));

    return successResponse({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
