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

export const updateCouponSchema = z.object({
  id: z.string().min(1, "ID do cupom é obrigatório"),
  code: z
    .string()
    .min(1)
    .max(30)
    .transform((val) => val.toUpperCase())
    .optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  discountValue: z.number().positive().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  maxUsesPerUser: z.number().int().positive().nullable().optional(),
  minOrderAmount: z.number().positive().nullable().optional(),
  validFrom: z.coerce.date().optional(),
  validUntil: z.coerce.date().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const deleteCouponSchema = z.object({
  id: z.string().min(1, "ID do cupom é obrigatório"),
});
