import { prisma } from "@/lib/prisma";

export const drawRepository = {
  async create(data: {
    raffleId: string;
    adminId: string;
    winningNumber: number;
    resultHash: string;
    seed: string;
    drawMethod?: string;
  }) {
    return prisma.raffleDraw.create({
      data: {
        raffleId: data.raffleId,
        adminId: data.adminId,
        winningNumber: data.winningNumber,
        resultHash: data.resultHash,
        seed: data.seed,
        drawMethod: data.drawMethod ?? "crypto",
      },
    });
  },

  async findByRaffle(raffleId: string) {
    return prisma.raffleDraw.findMany({
      where: { raffleId },
      include: { winner: true },
      orderBy: { drawnAt: "desc" },
    });
  },

  async createWinner(data: {
    drawId: string;
    raffleId: string;
    userId: string;
    numberWon: number;
  }) {
    return prisma.winner.create({
      data: {
        drawId: data.drawId,
        raffleId: data.raffleId,
        userId: data.userId,
        numberWon: data.numberWon,
      },
    });
  },
};
