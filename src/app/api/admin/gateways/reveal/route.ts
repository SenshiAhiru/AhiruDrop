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

    const config = gateway.configs.find((c) => c.key === key);
    if (!config) return errorResponse("Credencial não encontrada", 404);

    let value = config.value;
    try {
      value = decrypt(config.value);
    } catch {}

    return successResponse({ value });
  } catch (error) {
    return handleApiError(error);
  }
}
