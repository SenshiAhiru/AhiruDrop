import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAdmin,
} from "@/lib/api-utils";
import { settingsService } from "@/services/settings.service";
import { auditService } from "@/services/audit.service";

/**
 * Keys that admins are NOT allowed to write through this endpoint.
 * These are reserved for system-managed state (auth tokens, internal flags
 * that could become privilege-escalation vectors if writable).
 */
const RESERVED_KEY_PATTERNS: RegExp[] = [
  /^steam_token:/i,    // legacy Steam OIDC tokens (now in steam_login_tokens table)
  /^password_reset:/i, // future password reset tokens
  /^session:/i,        // future session-related state
];

function isReservedKey(key: string): boolean {
  return RESERVED_KEY_PATTERNS.some((re) => re.test(key));
}

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
    const session = await requireAdmin();

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

    // Validate every entry up-front so we don't half-apply
    for (const setting of settings) {
      if (!setting.key || setting.value === undefined) {
        return errorResponse("Cada setting deve ter 'key' e 'value'", 422);
      }
      if (isReservedKey(String(setting.key))) {
        return errorResponse(
          `Key reservada — não pode ser editada via settings: ${setting.key}`,
          403
        );
      }
    }

    for (const setting of settings) {
      await settingsService.set(setting.key, setting.value, setting.type);
    }

    // Audit: settings changes can have wide impact (FX rates, fees, flags).
    await auditService.log(
      session.user.id,
      "SETTINGS_UPDATED",
      "system_setting",
      "bulk",
      { keys: settings.map((s: any) => s.key) }
    );

    const updated = await settingsService.getAll();

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
