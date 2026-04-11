import { z } from "zod";

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(1, "Codigo e obrigatorio")
    .max(30, "Codigo deve ter no maximo 30 caracteres")
    .transform((val) => val.toUpperCase()),
  discountType: z.enum(["percentage", "fixed"], {
    required_error: "Tipo de desconto e obrigatorio",
  }),
  discountValue: z
    .number()
    .positive("Valor do desconto deve ser positivo"),
  maxUses: z
    .number()
    .int()
    .positive("Maximo de usos deve ser positivo")
    .optional(),
  minOrderAmount: z
    .number()
    .positive("Valor minimo do pedido deve ser positivo")
    .optional(),
  validFrom: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
});

export type CreateCouponSchema = z.infer<typeof createCouponSchema>;
