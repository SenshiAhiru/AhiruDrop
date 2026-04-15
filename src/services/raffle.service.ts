import { raffleRepository } from "@/repositories/raffle.repository";
import { raffleNumberRepository } from "@/repositories/raffle-number.repository";
import { notificationService } from "./notification.service";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";
import { RaffleStatus } from "@prisma/client";
import { encrypt } from "@/lib/crypto";
import {
  generateServerSeed,
  hashSeed,
  getCurrentBtcHeight,
  DRAW_BLOCK_LEAD,
} from "@/lib/provably-fair";

export const raffleService = {
  async list(params: {
    status?: RaffleStatus;
    statuses?: RaffleStatus[];
    isFeatured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const result = await raffleRepository.findMany(params);

    // Enrich with stats
    const enriched = await Promise.all(
      result.data.map(async (raffle) => {
        const stats = await raffleRepository.getStats(raffle.id);
        return { ...raffle, stats };
      })
    );

    return { ...result, data: enriched };
  },

  async getBySlug(slug: string) {
    const raffle = await raffleRepository.findBySlug(slug);
    if (!raffle) return null;

    const stats = await raffleRepository.getStats(raffle.id);
    return { ...raffle, stats };
  },

  async getById(id: string) {
    const raffle = await raffleRepository.findById(id);
    if (!raffle) return null;

    const stats = await raffleRepository.getStats(raffle.id);
    return { ...raffle, stats };
  },

  async create(data: {
    title: string;
    description: string;
    pricePerNumber: number;
    totalNumbers: number;
    minPerPurchase?: number;
    maxPerPurchase?: number;
    category?: string;
    prizeType?: string;
    regulation?: string;
    featuredImage?: string;
    scheduledDrawAt?: Date;
    isFeatured?: boolean;
    status?: string;
    // CS2 Skin fields
    skinName?: string;
    skinImage?: string;
    skinWeapon?: string;
    skinCategory?: string;
    skinRarity?: string;
    skinRarityColor?: string;
    skinWear?: string;
    skinFloat?: number | null;
    skinStatTrak?: boolean;
    skinSouvenir?: boolean;
    skinExteriorMin?: number | null;
    skinExteriorMax?: number | null;
    skinMarketPrice?: number | null;
  }) {
    const slug = generateSlug(data.title);
    const status = (data.status === "ACTIVE" ? "ACTIVE" : "DRAFT") as "ACTIVE" | "DRAFT";

    // Provably fair commit — before raffle exists, so impossible to tamper later
    const serverSeed = generateServerSeed();
    const serverSeedHash = hashSeed(serverSeed);
    const serverSeedEncrypted = encrypt(serverSeed);

    // Try to lock the beacon block height at creation.
    // If mempool.space is unreachable, leave it null — admin can backfill later.
    let drawBlockHeight: number | null = null;
    try {
      const currentHeight = await getCurrentBtcHeight();
      drawBlockHeight = currentHeight + DRAW_BLOCK_LEAD;
    } catch (err) {
      console.warn("Could not lock Bitcoin block height at creation:", err);
    }

    const raffle = await raffleRepository.create({
      ...data,
      slug,
      pricePerNumber: data.pricePerNumber,
      featuredImage: data.skinImage || data.featuredImage,
      status,
      serverSeedHash,
      serverSeedEncrypted,
      drawBlockHeight,
    } as any);

    // Generate all numbers for this raffle
    await raffleNumberRepository.generateNumbers(raffle.id, data.totalNumbers);

    return raffle;
  },

  async update(id: string, data: Record<string, any>) {
    const raffle = await raffleRepository.findById(id);
    if (!raffle) throw new Error("Rifa não encontrada");

    // Don't allow editing certain fields after activation
    if (raffle.status !== "DRAFT" && raffle.status !== "PAUSED") {
      const protectedFields = ["totalNumbers", "pricePerNumber"];
      for (const field of protectedFields) {
        if (data[field] !== undefined && data[field] !== (raffle as any)[field]) {
          throw new Error(`Não é possível alterar ${field} após ativação`);
        }
      }
    }

    return raffleRepository.update(id, data);
  },

  async updateStatus(id: string, status: RaffleStatus) {
    const raffle = await raffleRepository.findById(id);
    if (!raffle) throw new Error("Rifa não encontrada");

    // Validate status transitions
    const validTransitions: Record<string, RaffleStatus[]> = {
      DRAFT: ["ACTIVE", "CANCELLED"],
      ACTIVE: ["PAUSED", "CLOSED", "CANCELLED"],
      PAUSED: ["ACTIVE", "CLOSED", "CANCELLED"],
      CLOSED: ["DRAWN"],
      DRAWN: [],
      CANCELLED: [],
    };

    const allowed = validTransitions[raffle.status] || [];
    if (!allowed.includes(status)) {
      throw new Error(`Transição de ${raffle.status} para ${status} não permitida`);
    }

    // Refund all participants when cancelling
    if (status === "CANCELLED") {
      const result = await this.refundParticipants(id, raffle.title);
      console.log(
        `[raffle] Cancelled raffle ${id}: refunded ${result.refundedUsers} users, ${result.totalRefunded.toFixed(2)} AHC`
      );
    }

    const updateData: any = { status };
    if (status === "CLOSED") updateData.closedAt = new Date();

    const updated = await raffleRepository.update(id, updateData);

    // Notify admins when raffle becomes CLOSED (ready to draw)
    if (status === "CLOSED" && raffle.status !== "CLOSED") {
      try {
        await notificationService.notifyAdminsRaffleReadyToDraw(
          raffle.id,
          raffle.title,
          raffle.slug
        );
      } catch (err) {
        console.error("[raffle] failed to notify admins of closed raffle:", err);
      }
    }

    return updated;
  },

  /**
   * Refunds all participants of a raffle.
   * For each user who bought tickets: increments balance by what they paid,
   * marks their orders as REFUNDED, and sends a notification.
   * Returns the number of users refunded.
   */
  async refundParticipants(raffleId: string, raffleTitle: string) {
    // Find all PAID numbers for this raffle with their orders
    const paidNumbers = await prisma.raffleNumber.findMany({
      where: { raffleId, status: "PAID" },
      select: { id: true, number: true, orderId: true },
    });

    if (paidNumbers.length === 0) return { refundedUsers: 0, totalRefunded: 0 };

    const orderIds = Array.from(
      new Set(paidNumbers.map((n) => n.orderId).filter((v): v is string => Boolean(v)))
    );

    if (orderIds.length === 0) return { refundedUsers: 0, totalRefunded: 0 };

    // Get orders with their users and amounts
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds }, status: "CONFIRMED" },
      select: {
        id: true,
        userId: true,
        finalAmount: true,
        user: { select: { id: true, name: true } },
      },
    });

    // Group refund amounts by user
    const refundByUser = new Map<string, { name: string; amount: number; orderIds: string[] }>();
    for (const order of orders) {
      const entry = refundByUser.get(order.userId);
      const amount = Number(order.finalAmount);
      if (entry) {
        entry.amount += amount;
        entry.orderIds.push(order.id);
      } else {
        refundByUser.set(order.userId, {
          name: order.user.name ?? "Usuário",
          amount,
          orderIds: [order.id],
        });
      }
    }

    // Execute refunds in a transaction
    let totalRefunded = 0;
    await prisma.$transaction(async (tx) => {
      for (const [userId, info] of refundByUser) {
        // Refund balance
        await tx.user.update({
          where: { id: userId },
          data: { balance: { increment: info.amount } },
        });

        // Mark orders as REFUNDED
        await tx.order.updateMany({
          where: { id: { in: info.orderIds } },
          data: { status: "REFUNDED" },
        });

        totalRefunded += info.amount;
      }

      // Release all numbers back to AVAILABLE (they'll be deleted shortly if deleting the raffle)
      await tx.raffleNumber.updateMany({
        where: { raffleId, status: "PAID" },
        data: { status: "AVAILABLE", orderId: null },
      });

      // Also release RESERVED numbers
      await tx.raffleNumber.updateMany({
        where: { raffleId, status: "RESERVED" },
        data: { status: "AVAILABLE", orderId: null, reservedUntil: null },
      });
    });

    // Send notifications to each refunded user (fire-and-forget)
    for (const [userId, info] of refundByUser) {
      try {
        await notificationService.create(
          userId,
          "SYSTEM",
          "Reembolso de rifa cancelada",
          `A rifa "${raffleTitle}" foi cancelada. Seus ${info.amount.toFixed(2)} AHC foram devolvidos ao seu saldo.`,
          { raffleTitle, amount: info.amount, link: "/dashboard" }
        );
      } catch (err) {
        console.error(`[raffle] failed to notify user ${userId} of refund:`, err);
      }
    }

    console.log(
      `[raffle] Refunded ${refundByUser.size} users totaling ${totalRefunded.toFixed(2)} AHC for raffle ${raffleId}`
    );

    return { refundedUsers: refundByUser.size, totalRefunded };
  },

  async delete(id: string) {
    const raffle = await raffleRepository.findById(id);
    if (!raffle) throw new Error("Rifa não encontrada");

    // Refund all participants before deleting
    await this.refundParticipants(id, raffle.title);

    return raffleRepository.delete(id);
  },

  async getNumbers(raffleId: string) {
    return raffleNumberRepository.findByRaffle(raffleId);
  },

  async duplicate(id: string) {
    const raffle = await raffleRepository.findById(id);
    if (!raffle) throw new Error("Rifa não encontrada");

    const {
      id: _,
      slug: __,
      createdAt: ___,
      updatedAt: ____,
      // Strip provably-fair fields — new ones will be generated for the duplicate
      serverSeedHash: _s1,
      serverSeedEncrypted: _s2,
      drawBlockHeight: _s3,
      images: _s4,
      ...data
    } = raffle as any;

    return this.create({
      ...data,
      title: `${data.title} (cópia)`,
      pricePerNumber: Number(data.pricePerNumber),
      status: undefined as any, // Will be set to DRAFT in create
    });
  },
};
