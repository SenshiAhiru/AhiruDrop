import { raffleRepository } from "@/repositories/raffle.repository";
import { raffleNumberRepository } from "@/repositories/raffle-number.repository";
import { generateSlug } from "@/lib/utils";
import { RaffleStatus } from "@prisma/client";

export const raffleService = {
  async list(params: {
    status?: RaffleStatus;
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

    const raffle = await raffleRepository.create({
      ...data,
      slug,
      pricePerNumber: data.pricePerNumber,
      featuredImage: data.skinImage || data.featuredImage,
      status,
    });

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

    const updateData: any = { status };
    if (status === "CLOSED") updateData.closedAt = new Date();

    return raffleRepository.update(id, updateData);
  },

  async delete(id: string) {
    const raffle = await raffleRepository.findById(id);
    if (!raffle) throw new Error("Rifa não encontrada");

    if (raffle.status !== "DRAFT" && raffle.status !== "CANCELLED") {
      throw new Error("Apenas rifas em rascunho ou canceladas podem ser excluídas");
    }

    return raffleRepository.delete(id);
  },

  async getNumbers(raffleId: string) {
    return raffleNumberRepository.findByRaffle(raffleId);
  },

  async duplicate(id: string) {
    const raffle = await raffleRepository.findById(id);
    if (!raffle) throw new Error("Rifa não encontrada");

    const { id: _, slug: __, createdAt: ___, updatedAt: ____, ...data } = raffle;

    return this.create({
      ...data,
      title: `${data.title} (cópia)`,
      pricePerNumber: Number(data.pricePerNumber),
      status: undefined as any, // Will be set to DRAFT in create
    });
  },
};
