import { RaffleStatus } from "@/constants/raffle-status";

export interface RaffleWithStats {
  id: string;
  title: string;
  slug: string;
  description: string;
  pricePerNumber: number;
  totalNumbers: number;
  maxPerPurchase: number;
  category: string;
  prizeType: string;
  status: RaffleStatus;
  imageUrl?: string;
  drawDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  soldCount: number;
  availableCount: number;
  soldPercentage: number;
}

export interface RaffleFilters {
  status?: RaffleStatus;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface NumberSelection {
  raffleId: string;
  number: number;
  isSelected: boolean;
}

export interface CreateRaffleInput {
  title: string;
  description: string;
  pricePerNumber: number;
  totalNumbers: number;
  maxPerPurchase: number;
  category: string;
  prizeType: string;
  status?: RaffleStatus;
  imageUrl?: string;
  drawDate?: Date;
}

export interface UpdateRaffleInput extends Partial<CreateRaffleInput> {
  id: string;
}
