import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAdmin,
} from "@/lib/api-utils";
import { settingsService } from "@/services/settings.service";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const settings = await settingsService.getAll();

    return successResponse(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();

    let body: any;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON body", 422);
    }

    const { settings } = body;

    if (!Array.isArray(settings) || settings.length === 0) {
      return errorResponse("settings deve ser um array com ao menos um item", 422);
    }

    for (const setting of settings) {
      if (!setting.key || setting.value === undefined) {
        return errorResponse("Cada setting deve ter 'key' e 'value'", 422);
      }

      await settingsService.set(setting.key, setting.value, setting.type);
    }

    const updated = await settingsService.getAll();

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
