import { NextRequest } from "next/server";
import { z } from "zod";
import { errorResponse, handleApiError } from "@/lib/api-utils";
import { applyRateLimit } from "@/lib/rate-limit";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .max(128, "A senha deve ter no máximo 128 caracteres"),
});

export async function POST(req: NextRequest) {
  // Rate limit: 5 tentativas de reset por IP a cada 15 minutos
  const limited = applyRateLimit(req, {
    key: "reset-password",
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (limited) return limited;

  try {
    const body = await req.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(result.error.issues[0].message);
    }

    // TODO: Implement when token storage and email service are ready

    return errorResponse("Funcionalidade em implementacao. Tente novamente em breve.", 501);
  } catch (error) {
    return handleApiError(error);
  }
}
