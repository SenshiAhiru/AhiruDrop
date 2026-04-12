import { z } from "zod";
import { ROLES } from "@/constants/roles";

const roleValues = Object.values(ROLES) as [string, ...string[]];

export const updateUserSchema = z.object({
  role: z.enum(roleValues).optional(),
  isActive: z.boolean().optional(),
});

export const drawRaffleSchema = z.object({
  raffleId: z.string().min(1, "ID da rifa é obrigatório"),
});

export const systemSettingsSchema = z.object({
  key: z
    .string()
    .min(1, "Chave é obrigatória")
    .max(100, "Chave deve ter no máximo 100 caracteres"),
  value: z.string().min(1, "Valor é obrigatório"),
  type: z
    .string()
    .min(1, "Tipo é obrigatório"),
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type DrawRaffleSchema = z.infer<typeof drawRaffleSchema>;
export type SystemSettingsSchema = z.infer<typeof systemSettingsSchema>;
