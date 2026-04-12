import { z } from "zod";

export const createOrderSchema = z.object({
  raffleId: z
    .string()
    .min(1, "ID da rifa é obrigatório"),
  numbers: z
    .array(z.number().int().positive("Número deve ser positivo"))
    .min(1, "Selecione ao menos um número"),
});

export type CreateOrderSchema = z.infer<typeof createOrderSchema>;
