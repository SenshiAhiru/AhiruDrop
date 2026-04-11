import { z } from "zod";
import { errorResponse, handleApiError } from "@/lib/api-utils";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token e obrigatorio"),
  password: z
    .string()
    .min(6, "A senha deve ter no minimo 6 caracteres")
    .max(128, "A senha deve ter no maximo 128 caracteres"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(result.error.errors[0].message);
    }

    // TODO: Implement when token storage and email service are ready
    // Steps:
    // 1. Find token in database
    // 2. Check if token is expired
    // 3. Hash new password
    // 4. Update user password
    // 5. Delete used token
    // 6. Return success

    return errorResponse("Funcionalidade em implementacao. Tente novamente em breve.", 501);
  } catch (error) {
    return handleApiError(error);
  }
}
