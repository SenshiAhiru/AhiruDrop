import { z } from "zod";
import { RAFFLE_STATUS } from "@/constants/raffle-status";

const raffleStatusValues = Object.values(RAFFLE_STATUS) as [string, ...string[]];

export const createRaffleSchema = z.object({
  title: z
    .string()
    .min(1, "Título é obrigatório")
    .max(200, "Título deve ter no máximo 200 caracteres"),
  description: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(5000, "Descrição deve ter no máximo 5000 caracteres"),
  pricePerNumber: z
    .number()
    .positive("Preço deve ser positivo"),
  totalNumbers: z
    .number()
    .int("Total de números deve ser inteiro")
    .positive("Total de números deve ser positivo"),
  maxPerPurchase: z
    .number()
    .int("Máximo por compra deve ser inteiro")
    .positive("Máximo por compra deve ser positivo")
    .optional()
    .default(10),
  category: z.string().optional(),
  prizeType: z.string().optional(),
  status: z
    .enum(raffleStatusValues)
    .optional()
    .default(RAFFLE_STATUS.DRAFT),
  imageUrl: z.string().url("URL da imagem inválida").optional(),
  drawDate: z.coerce.date().optional(),
  // CS2 Skin fields
  skinName: z.string().optional(),
  skinImage: z.string().optional(),
  skinWeapon: z.string().optional(),
  skinCategory: z.string().optional(),
  skinRarity: z.string().optional(),
  skinRarityColor: z.string().optional(),
  skinWear: z.string().optional(),
  skinFloat: z.number().min(0).max(1).optional().nullable(),
  skinStatTrak: z.boolean().optional().default(false),
  skinSouvenir: z.boolean().optional().default(false),
  skinExteriorMin: z.number().min(0).max(1).optional().nullable(),
  skinExteriorMax: z.number().min(0).max(1).optional().nullable(),
  skinMarketPrice: z.number().optional().nullable(),
});

export const updateRaffleSchema = createRaffleSchema.partial();

export type CreateRaffleSchema = z.infer<typeof createRaffleSchema>;
export type UpdateRaffleSchema = z.infer<typeof updateRaffleSchema>;
