import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAuth,
  validateBody,
} from "@/lib/api-utils";
import { userService } from "@/services/user.service";
import { updateProfileSchema } from "@/validators/user.validator";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const profile = await userService.getProfile(session.user.id);

    return successResponse(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { data, error } = await validateBody(req, updateProfileSchema);

    if (error) {
      return errorResponse(error, 422);
    }

    const updated = await userService.updateProfile(session.user.id, data!);

    return successResponse(updated);
  } catch (error) {
    if (error instanceof Error) {
      const knownErrors = [
        "telefone já está cadastrado",
        "CPF já está cadastrado",
        "Usuário não encontrado",
      ];

      if (knownErrors.some((msg) => error.message.includes(msg))) {
        return errorResponse(error.message, 400);
      }
    }
    return handleApiError(error);
  }
}
