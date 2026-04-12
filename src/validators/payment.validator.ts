import { z } from "zod";

export const createPaymentSchema = z.object({
  orderId: z
    .string()
    .min(1, "ID do pedido é obrigatório"),
  gatewayName: z
    .string()
    .min(1, "Nome do gateway é obrigatório"),
  method: z.string().optional(),
});

export const gatewayConfigSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  displayName: z
    .string()
    .min(1, "Nome de exibição é obrigatório")
    .max(100, "Nome de exibição deve ter no máximo 100 caracteres"),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  sandbox: z.boolean(),
  credentials: z.record(z.string(), z.string()),
});

export type CreatePaymentSchema = z.infer<typeof createPaymentSchema>;
export type GatewayConfigSchema = z.infer<typeof gatewayConfigSchema>;
