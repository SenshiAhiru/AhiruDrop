import { prisma } from "@/lib/prisma";
import { NumberStatus } from "@prisma/client";

export const raffleNumberRepository = {
  async generateNumbers(raffleId: string, total: number) {
    const data = Array.from({ length: total }, (_, i) => ({
      raffleId,
      number: i + 1,
      status: NumberStatus.AVAILABLE,
    }));

    return prisma.raffleNumber.createMany({ data });
  },

  async findByRaffle(raffleId: string) {
    return prisma.raffleNumber.findMany({
      where: { raffleId },
      select: { id: true, number: true, status: true },
      orderBy: { number: "asc" },
    });
  },

  async findAvailable(raffleId: string, numbers: number[]) {
    return prisma.raffleNumber.findMany({
      where: {
        raffleId,
        number: { in: numbers },
        status: NumberStatus.AVAILABLE,
      },
    });
  },

  async reserveNumbers(
    raffleId: string,
    numbers: number[],
    orderId: string,
    expiresAt: Date
  ) {
    return prisma.raffleNumber.updateMany({
      where: {
        raffleId,
        number: { in: numbers },
        status: NumberStatus.AVAILABLE,
      },
      data: {
        status: NumberStatus.RESERVED,
        orderId,
        reservedUntil: expiresAt,
      },
    });
  },

  async confirmNumbers(orderId: string) {
    return prisma.raffleNumber.updateMany({
      where: {
        orderId,
        status: NumberStatus.RESERVED,
      },
      data: {
        status: NumberStatus.PAID,
        reservedUntil: null,
      },
    });
  },

  async releaseExpired() {
    const result = await prisma.raffleNumber.updateMany({
      where: {
        status: NumberStatus.RESERVED,
        reservedUntil: { lt: new Date() },
      },
      data: {
        status: NumberStatus.AVAILABLE,
        orderId: null,
        reservedUntil: null,
      },
    });

    return result.count;
  },

  async releaseByOrder(orderId: string) {
    return prisma.raffleNumber.updateMany({
      where: {
        orderId,
        status: NumberStatus.RESERVED,
      },
      data: {
        status: NumberStatus.AVAILABLE,
        orderId: null,
        reservedUntil: null,
      },
    });
  },
};
