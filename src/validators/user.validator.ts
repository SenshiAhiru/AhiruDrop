import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter no minimo 2 caracteres")
    .optional(),
  phone: z
    .string()
    .min(10, "Telefone invalido")
    .max(15, "Telefone invalido")
    .optional(),
  cpf: z
    .string()
    .length(11, "CPF deve ter 11 digitos")
    .optional(),
  avatarUrl: z
    .string()
    .url("URL do avatar invalida")
    .optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Senha atual e obrigatoria"),
    newPassword: z
      .string()
      .min(6, "Nova senha deve ter no minimo 6 caracteres"),
    confirmNewPassword: z
      .string()
      .min(1, "Confirmacao de senha e obrigatoria"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "As senhas nao coincidem",
    path: ["confirmNewPassword"],
  });

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
