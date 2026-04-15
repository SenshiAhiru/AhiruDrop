import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

/**
 * Public list of all drawn raffles with winners.
 * No auth — fully public hall of fame.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || "20")));

    const where = { status: "DRAWN" as const };

    const [raffles, total] = await Promise.all([
      prisma.raffle.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
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
          updatedAt: true,
          draws: {
            orderBy: { drawnAt: "desc" },
            take: 1,
            select: {
              id: true,
              winningNumber: true,
              drawnAt: true,
              winner: {
                select: {
                  userId: true,
                  numberWon: true,
                },
              },
            },
          },
        },
      }),
      prisma.raffle.count({ where }),
    ]);

    // Fetch winner user info in a single query
    const userIds = raffles
      .flatMap((r) => r.draws.flatMap((d) => (d.winner ? [d.winner.userId] : [])))
      .filter(Boolean);

    const users =
      userIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, avatarUrl: true },
          })
        : [];
    const userById = new Map(users.map((u) => [u.id, u]));

    const data = raffles.map((r) => {
      const draw = r.draws[0];
      const user = draw?.winner ? userById.get(draw.winner.userId) : null;
      return {
        id: r.id,
        title: r.title,
        slug: r.slug,
        skinImage: r.skinImage,
        skinRarity: r.skinRarity,
        skinRarityColor: r.skinRarityColor,
        skinWear: r.skinWear,
        skinWeapon: r.skinWeapon,
        skinMarketPrice: r.skinMarketPrice ? Number(r.skinMarketPrice) : null,
        totalNumbers: r.totalNumbers,
        pricePerNumber: Number(r.pricePerNumber),
        drawnAt: draw?.drawnAt ?? r.updatedAt,
        winningNumber: draw?.winningNumber ?? null,
        winner: user
          ? {
              name: user.name ?? "Anônimo",
              avatarUrl: user.avatarUrl ?? null,
            }
          : null,
      };
    });

    return successResponse({
      data,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
