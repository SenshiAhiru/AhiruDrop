import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { raffleService } from "@/services/raffle.service";
import { prisma } from "@/lib/prisma";

/**
 * Public endpoint returning all provably-fair data for a raffle.
 * Pre-draw: returns commitment (hash + target block height)
 * Post-draw: returns everything needed to independently verify the winner
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ raffleId: string }> }
) {
  try {
    const { raffleId } = await params;

    let raffle = await raffleService.getBySlug(raffleId);
    if (!raffle) raffle = await raffleService.getById(raffleId);
    if (!raffle) return errorResponse("Rifa não encontrada", 404);

    const r = raffle as any;
    const draw = await prisma.raffleDraw.findFirst({
      where: { raffleId: raffle.id },
      include: { winner: true },
      orderBy: { drawnAt: "desc" },
    });

    const d = draw as any;

    // Count eligible (paid) tickets — needed to reproduce the index calculation
    const paidCount = await prisma.raffleNumber.count({
      where: { raffleId: raffle.id, status: "PAID" },
    });

    return successResponse({
      raffleId: raffle.id,
      raffleTitle: raffle.title,
      status: raffle.status,
      totalPaidTickets: paidCount,
      commit: {
        serverSeedHash: r.serverSeedHash ?? null,
        drawBlockHeight: r.drawBlockHeight ?? null,
      },
      reveal: draw
        ? {
            drawId: draw.id,
            drawnAt: draw.drawnAt,
            drawMethod: draw.drawMethod,
            winningNumber: draw.winningNumber,
            serverSeedRevealed: d.serverSeedRevealed ?? null,
            blockHash: d.blockHash ?? null,
            blockHeight: d.blockHeight ?? null,
            hasWinner: Boolean(draw.winner),
          }
        : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
