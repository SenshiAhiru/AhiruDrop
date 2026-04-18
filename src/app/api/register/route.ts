import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { applyRateLimit, getClientIp } from "@/lib/rate-limit";
import { validatePasswordStrength } from "@/lib/password-policy";
import { verifyTurnstile } from "@/lib/turnstile";
import { notificationService } from "@/services/notification.service";

const MULTI_ACCOUNT_THRESHOLD = 3; // >= this many accounts from same IP within window triggers alert
const MULTI_ACCOUNT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h

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
  turnstileToken: z.string().optional(),
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

    const { name, email, password, turnstileToken } = result.data;

    // CAPTCHA (Cloudflare Turnstile) — skipped if not configured
    const turnstileResult = await verifyTurnstile(turnstileToken, getClientIp(req));
    if (!turnstileResult.ok) {
      return errorResponse(turnstileResult.message ?? "Verificação humana falhou", 403);
    }

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

    const ip = getClientIp(req);

    // Create user with signup IP tracked
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        signupIp: ip,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Multi-account detection: count other accounts from the same IP
    // in the last 24h. Does NOT block signup (false positives are bad UX —
    // shared NAT, university, VPN), but notifies admins.
    if (ip && ip !== "unknown") {
      try {
        const recentFromIp = await prisma.user.count({
          where: {
            signupIp: ip,
            createdAt: { gte: new Date(Date.now() - MULTI_ACCOUNT_WINDOW_MS) },
            id: { not: user.id },
          },
        });
        if (recentFromIp + 1 >= MULTI_ACCOUNT_THRESHOLD) {
          await notificationService.sendToAdmins(
            "SYSTEM",
            "Possível multi-conta detectada",
            `IP ${ip} criou ${recentFromIp + 1} contas em 24h. Último: ${user.name} (${user.email}).`,
            { userId: user.id, ip, count: recentFromIp + 1, link: "/admin/users" }
          );
        }
      } catch (err) {
        console.error("Multi-account detection failed:", err);
      }
    }

    return successResponse(user, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
