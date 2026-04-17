import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { orderService } from "@/services/order.service";
import { auditService } from "@/services/audit.service";
import { z } from "zod";

const bulkSchema = z.object({
  orderIds: z.array(z.string()).min(1).max(500),
  action: z.enum(["cancel", "expire"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Dados inválidos", 422);
    }

    const { orderIds, action } = parsed.data;

    let affected = 0;
    const errors: { id: string; error: string }[] = [];

    // Process sequentially to release raffle numbers correctly
    for (const id of orderIds) {
      try {
        if (action === "cancel") {
          await orderService.cancel(id);
        } else {
          await orderService.expire(id);
        }
        affected++;
      } catch (err) {
        errors.push({
          id,
          error: err instanceof Error ? err.message : "erro",
        });
      }
    }

    await auditService.log(
      session.user.id,
      `ORDER_BULK_${action.toUpperCase()}`,
      "order",
      "bulk",
      { orderIds, action, affected, errorCount: errors.length }
    );

    return successResponse({ affected, errors, action });
  } catch (error) {
    return handleApiError(error);
  }
}
