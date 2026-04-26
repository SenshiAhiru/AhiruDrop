import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAdmin,
} from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/crypto";
import { auditService } from "@/services/audit.service";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const gateways = await prisma.paymentGateway.findMany({
      include: { configs: true },
      orderBy: { name: "asc" },
    });

    // Return configs with masked values (show last 4 chars)
    const result = gateways.map((gw) => ({
      ...gw,
      configs: gw.configs.map((c) => {
        let maskedValue = "";
        try {
          const decrypted = decrypt(c.value);
          maskedValue = decrypted.length > 4
            ? "•".repeat(decrypted.length - 4) + decrypted.slice(-4)
            : "•".repeat(decrypted.length);
        } catch {
          // If not encrypted, use raw value masked
          maskedValue = c.value.length > 4
            ? "•".repeat(c.value.length - 4) + c.value.slice(-4)
            : "•".repeat(c.value.length);
        }
        return {
          key: c.key,
          value: maskedValue,
          hasValue: c.value.length > 0,
        };
      }),
    }));

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();

    let body: any;
    try {
      body = await req.json();
    } catch {
      return errorResponse("JSON inválido", 400);
    }

    const { name, displayName, isActive, isDefault, sandbox, credentials } = body;

    if (!name) return errorResponse("Nome do gateway é obrigatório", 400);

    // If setting as default, clear others first
    if (isDefault) {
      await prisma.paymentGateway.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    // Upsert gateway
    const gateway = await prisma.paymentGateway.upsert({
      where: { name },
      update: {
        displayName: displayName || name,
        isActive: Boolean(isActive),
        isDefault: Boolean(isDefault),
        sandbox: Boolean(sandbox),
      },
      create: {
        name,
        displayName: displayName || name,
        isActive: Boolean(isActive),
        isDefault: Boolean(isDefault),
        sandbox: Boolean(sandbox),
      },
    });

    // Upsert each credential (only if value is provided and not masked)
    if (credentials && typeof credentials === "object") {
      for (const [key, value] of Object.entries(credentials)) {
        const strValue = String(value);
        // Skip masked values (contain dots) - only save real values
        if (!strValue || strValue.includes("•")) continue;

        const encryptedValue = encrypt(strValue);
        await prisma.paymentGatewayConfig.upsert({
          where: { gatewayId_key: { gatewayId: gateway.id, key } },
          update: { value: encryptedValue },
          create: { gatewayId: gateway.id, key, value: encryptedValue },
        });
      }
    }

    // Audit: gateway config changes are sensitive (toggling default,
    // sandbox/live mode, credential rotation). Log the metadata; never
    // log the actual credential values.
    const credentialKeys =
      credentials && typeof credentials === "object"
        ? Object.entries(credentials)
            .filter(([, v]) => {
              const s = String(v);
              return s && !s.includes("•");
            })
            .map(([k]) => k)
        : [];
    await auditService.log(
      session.user.id,
      "GATEWAY_CONFIG_UPDATED",
      "payment_gateway",
      gateway.id,
      {
        name: gateway.name,
        isActive: gateway.isActive,
        isDefault: gateway.isDefault,
        sandbox: gateway.sandbox,
        credentialKeysUpdated: credentialKeys,
      }
    );

    return successResponse({
      id: gateway.id,
      name: gateway.name,
      isActive: gateway.isActive,
      isDefault: gateway.isDefault,
      sandbox: gateway.sandbox,
    }, 201);
  } catch (error) {
    console.error("Gateway save error:", error);
    return handleApiError(error);
  }
}
