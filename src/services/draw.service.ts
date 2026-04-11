import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { raffleRepository } from "@/repositories/raffle.repository";
import { raffleNumberRepository } from "@/repositories/raffle-number.repository";
import { notificationService } from "./notification.service";

export const drawService = {
  async executeDraw(raffleId: string, adminId: string) {
    const raffle = await raffleRepository.findById(raffleId);
    if (!raffle) throw new Error("Rifa nao encontrada");
    if (raffle.status !== "CLOSED") {
      throw new Error("A rifa precisa estar fechada para realizar o sorteio");
    }

    // Get only PAID numbers
    const paidNumbers = await raffleNumberRepository.findByRaffle(raffleId);
    const eligibleNumbers = paidNumbers.filter((n) => n.status === "PAID");

    if (eligibleNumbers.length === 0) {
      throw new Error("Nenhum numero foi vendido para esta rifa");
    }

    // Cryptographically secure random selection
    const seed = crypto.randomBytes(32).toString("hex");
    const randomIndex = crypto.randomInt(0, eligibleNumbers.length);
    const winningNumberRecord = eligibleNumbers[randomIndex];

    // Create audit hash
    const timestamp = new Date().toISOString();
    const hashInput = `${seed}:${winningNumberRecord.number}:${timestamp}:${raffleId}`;
    const resultHash = crypto
      .createHash("sha256")
      .update(hashInput)
      .digest("hex");

    // Save draw
    const draw = await prisma.raffleDraw.create({
      data: {
        raffleId,
        adminId,
        winningNumber: winningNumberRecord.number,
        resultHash,
        seed,
      },
    });

    // Find winner (user who owns this number)
    if (winningNumberRecord.id) {
      const numberWithOrder = await prisma.raffleNumber.findUnique({
        where: { id: winningNumberRecord.id },
        select: { orderId: true },
      });

      if (numberWithOrder?.orderId) {
        const order = await prisma.order.findUnique({
          where: { id: numberWithOrder.orderId },
        });

        if (order) {
          await prisma.winner.create({
            data: {
              drawId: draw.id,
              raffleId,
              userId: order.userId,
              numberWon: winningNumberRecord.number,
            },
          });

          // Notify winner
          await notificationService.notifyWinner(
            order.userId,
            raffle.title,
            winningNumberRecord.number
          );
        }
      }
    }

    // Update raffle status to DRAWN
    await raffleRepository.update(raffleId, { status: "DRAWN" });

    return {
      draw,
      winningNumber: winningNumberRecord.number,
      resultHash,
      seed,
      timestamp,
    };
  },

  async getResult(raffleId: string) {
    const draw = await prisma.raffleDraw.findFirst({
      where: { raffleId },
      include: { winner: true },
      orderBy: { drawnAt: "desc" },
    });

    if (!draw) return null;

    const raffle = await raffleRepository.findById(raffleId);
    return { draw, raffle };
  },
};
