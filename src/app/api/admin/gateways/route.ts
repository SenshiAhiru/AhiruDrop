import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAdmin,
  validateBody,
} from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { gatewayConfigSchema } from "@/validators/payment.validator";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const gateways = await prisma.paymentGateway.findMany({
      include: {
        configs: {
          select: {
            id: true,
            key: true,
            // Do not return decrypted values -- only existence
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Mask credential values for security
    const masked = gateways.map((gw) => ({
      ...gw,
      configs: gw.configs.map((c) => ({
        ...c,
        hasValue: true,
      })),
    }));

    return successResponse(masked);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { data, error } = await validateBody(req, gatewayConfigSchema);

    if (error) {
      return errorResponse(error, 422);
    }

    const { name, displayName, isActive, isDefault, sandbox, credentials } = data!;

    // If isDefault, clear other defaults first
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
        displayName,
        isActive,
        isDefault,
        sandbox,
      },
      create: {
        name,
        displayName,
        isActive,
        isDefault,
        sandbox,
      },
    });

    // Upsert each credential with encrypted value
    for (const [key, value] of Object.entries(credentials)) {
      const encryptedValue = encrypt(value);

      await prisma.paymentGatewayConfig.upsert({
        where: {
          gatewayId_key: {
            gatewayId: gateway.id,
            key,
          },
        },
        update: { value: encryptedValue },
        create: {
          gatewayId: gateway.id,
          key,
          value: encryptedValue,
        },
      });
    }

    return successResponse({
      id: gateway.id,
      name: gateway.name,
      displayName: gateway.displayName,
      isActive: gateway.isActive,
      isDefault: gateway.isDefault,
      sandbox: gateway.sandbox,
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
