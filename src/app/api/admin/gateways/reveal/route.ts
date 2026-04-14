import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const { gatewayName, key } = await req.json();
    if (!gatewayName || !key) return errorResponse("Gateway e key obrigatórios", 400);

    const gateway = await prisma.paymentGateway.findUnique({
      where: { name: gatewayName },
      include: { configs: true },
    });

    if (!gateway) return errorResponse("Gateway não encontrado", 404);

    // Try exact key, then with prefixes
    const keysToTry = [key, `test_${key}`, `live_${key}`];
    // Also try without prefix if key already has one
    if (key.startsWith("test_") || key.startsWith("live_")) {
      keysToTry.push(key.replace(/^(test_|live_)/, ""));
    }

    let value = "";
    for (const k of keysToTry) {
      const config = gateway.configs.find((c) => c.key === k);
      if (config) {
        try {
          value = decrypt(config.value);
        } catch {
          value = config.value;
        }
        break;
      }
    }

    if (!value) return errorResponse("Credencial não encontrada", 404);

    return successResponse({ value });
  } catch (error) {
    return handleApiError(error);
  }
}
