import { z } from "zod";

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(1, "Código é obrigatório")
    .max(30, "Código deve ter no máximo 30 caracteres")
    .transform((val) => val.toUpperCase()),
  discountType: z.enum(["PERCENTAGE", "FIXED"], {
    error: "Tipo de desconto é obrigatório",
  }),
  discountValue: z
    .number()
    .positive("Valor do desconto deve ser positivo"),
  maxUses: z
    .number()
    .int()
    .positive("Máximo de usos deve ser positivo")
    .optional(),
  maxUsesPerUser: z
    .number()
    .int()
    .positive("Máximo por usuário deve ser positivo")
    .optional(),
  minOrderAmount: z
    .number()
    .positive("Valor mínimo do pedido deve ser positivo")
    .optional(),
  validFrom: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
});

export type CreateCouponSchema = z.infer<typeof createCouponSchema>;
