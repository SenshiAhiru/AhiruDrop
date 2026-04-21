import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { applyRateLimit } from "@/lib/rate-limit";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido").toLowerCase().trim(),
});

export async function POST(req: NextRequest) {
  // Rate limit: 3 solicitações de reset por IP a cada 15 minutos
  const limited = applyRateLimit(req, {
    key: "forgot-password",
    limit: 3,
    windowMs: 15 * 60 * 1000,
  });
  if (limited) return limited;

  try {
    const body = await req.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(result.error.issues[0].message);
    }

    const { email } = result.data;

    // Check if user exists (but don't reveal this to the client)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // TODO: Implement token persistence + email delivery.
      // For now, do nothing — we return a generic success below to avoid
      // email enumeration. The previous implementation logged the token in
      // plain text, which was a security risk if logs were exposed.
    }

    // Always return success to prevent email enumeration
    return successResponse({
      message: "Se o email estiver cadastrado, você receberá um link de recuperação.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
