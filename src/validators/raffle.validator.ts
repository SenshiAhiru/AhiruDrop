import { z } from "zod";
import { RAFFLE_STATUS } from "@/constants/raffle-status";

const raffleStatusValues = Object.values(RAFFLE_STATUS) as [string, ...string[]];

export const createRaffleSchema = z.object({
  title: z
    .string()
    .min(1, "Titulo e obrigatorio")
    .max(120, "Titulo deve ter no maximo 120 caracteres"),
  description: z
    .string()
    .min(1, "Descricao e obrigatoria")
    .max(5000, "Descricao deve ter no maximo 5000 caracteres"),
  pricePerNumber: z
    .number()
    .positive("Preco deve ser positivo"),
  totalNumbers: z
    .number()
    .int("Total de numeros deve ser inteiro")
    .positive("Total de numeros deve ser positivo"),
  maxPerPurchase: z
    .number()
    .int("Maximo por compra deve ser inteiro")
    .positive("Maximo por compra deve ser positivo"),
  category: z
    .string()
    .min(1, "Categoria e obrigatoria"),
  prizeType: z
    .string()
    .min(1, "Tipo de premio e obrigatorio"),
  status: z
    .enum(raffleStatusValues)
    .optional()
    .default(RAFFLE_STATUS.DRAFT),
  imageUrl: z.string().url("URL da imagem invalida").optional(),
  drawDate: z.coerce.date().optional(),
});

export const updateRaffleSchema = createRaffleSchema.partial();

export type CreateRaffleSchema = z.infer<typeof createRaffleSchema>;
export type UpdateRaffleSchema = z.infer<typeof updateRaffleSchema>;
