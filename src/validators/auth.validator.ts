import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail e obrigatorio")
    .email("E-mail invalido"),
  password: z
    .string()
    .min(1, "Senha e obrigatoria")
    .min(6, "Senha deve ter no minimo 6 caracteres"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nome e obrigatorio")
      .min(2, "Nome deve ter no minimo 2 caracteres"),
    email: z
      .string()
      .min(1, "E-mail e obrigatorio")
      .email("E-mail invalido"),
    password: z
      .string()
      .min(1, "Senha e obrigatoria")
      .min(6, "Senha deve ter no minimo 6 caracteres"),
    confirmPassword: z
      .string()
      .min(1, "Confirmacao de senha e obrigatoria"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas nao coincidem",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail e obrigatorio")
    .email("E-mail invalido"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token e obrigatorio"),
    password: z
      .string()
      .min(1, "Senha e obrigatoria")
      .min(6, "Senha deve ter no minimo 6 caracteres"),
    confirmPassword: z
      .string()
      .min(1, "Confirmacao de senha e obrigatoria"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas nao coincidem",
    path: ["confirmPassword"],
  });

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
