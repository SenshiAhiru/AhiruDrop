import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .optional(),
  phone: z
    .string()
    .min(10, "Telefone inválido")
    .max(15, "Telefone inválido")
    .optional(),
  cpf: z
    .string()
    .length(11, "CPF deve ter 11 dígitos")
    .optional(),
  avatarUrl: z
    .string()
    .url("URL do avatar inválida")
    .optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Senha atual é obrigatória"),
    newPassword: z
      .string()
      .min(8, "Nova senha deve ter no mínimo 8 caracteres")
      .max(128, "Nova senha deve ter no máximo 128 caracteres")
      .regex(/[A-Z]/, "Nova senha deve ter pelo menos uma letra maiúscula")
      .regex(/[a-z]/, "Nova senha deve ter pelo menos uma letra minúscula")
      .regex(/[0-9]/, "Nova senha deve ter pelo menos um número"),
    confirmNewPassword: z
      .string()
      .min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "As senhas não coincidem",
    path: ["confirmNewPassword"],
  });

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
