import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { applyRateLimit } from "@/lib/rate-limit";
import { validatePasswordStrength } from "@/lib/password-policy";

const registerSchema = z.object({
  name: z
    .string()
    .min(2, "O nome deve ter no mínimo 2 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres")
    .trim(),
  email: z
    .string()
    .email("Email inválido")
    .max(255, "Email muito longo")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .max(128, "A senha deve ter no máximo 128 caracteres"),
});

export async function POST(req: NextRequest) {
  // Rate limit: 5 registros por IP a cada 10 minutos
  const limited = applyRateLimit(req, {
    key: "register",
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(result.error.issues[0].message);
    }

    const { name, email, password } = result.data;

    // Strong password policy server-side
    const policyCheck = validatePasswordStrength(password);
    if (!policyCheck.ok) {
      return errorResponse(policyCheck.message, 422);
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse("Este email já está em uso.", 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return successResponse(user, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
