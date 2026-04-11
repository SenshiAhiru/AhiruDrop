import { z } from "zod";

export const createPaymentSchema = z.object({
  orderId: z
    .string()
    .min(1, "ID do pedido e obrigatorio"),
  gatewayName: z
    .string()
    .min(1, "Nome do gateway e obrigatorio"),
  method: z.string().optional(),
});

export const gatewayConfigSchema = z.object({
  name: z
    .string()
    .min(1, "Nome e obrigatorio")
    .max(50, "Nome deve ter no maximo 50 caracteres"),
  displayName: z
    .string()
    .min(1, "Nome de exibicao e obrigatorio")
    .max(100, "Nome de exibicao deve ter no maximo 100 caracteres"),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  sandbox: z.boolean(),
  credentials: z.record(z.string(), z.string()),
});

export type CreatePaymentSchema = z.infer<typeof createPaymentSchema>;
export type GatewayConfigSchema = z.infer<typeof gatewayConfigSchema>;
