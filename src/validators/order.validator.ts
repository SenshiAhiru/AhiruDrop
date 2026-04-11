import { z } from "zod";

export const createOrderSchema = z.object({
  raffleId: z
    .string()
    .min(1, "ID da rifa e obrigatorio"),
  numbers: z
    .array(z.number().int().positive("Numero deve ser positivo"))
    .min(1, "Selecione ao menos um numero"),
});

export type CreateOrderSchema = z.infer<typeof createOrderSchema>;
