import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { auditService } from "@/services/audit.service";
import { z } from "zod";

const bulkSchema = z.object({
  userIds: z.array(z.string()).min(1).max(500),
  action: z.enum(["block", "unblock", "promote", "demote"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Dados inválidos", 422);
    }

    const { userIds, action } = parsed.data;

    // Protect self
    const filteredIds = userIds.filter((id) => id !== session.user.id);
    if (filteredIds.length === 0) {
      return errorResponse("Não é possível aplicar ação em lote a si mesmo", 400);
    }

    // Role changes (promote/demote) require SUPER_ADMIN. Regular ADMINs
    // cannot grant or revoke admin privileges in bulk.
    if ((action === "promote" || action === "demote") && session.user.role !== "SUPER_ADMIN") {
      return errorResponse("Apenas SUPER_ADMIN pode alterar papel de usuários.", 403);
    }

    // Demotion can never include a SUPER_ADMIN target — those must be
    // demoted individually with the safety checks in /api/admin/users PATCH.
    if (action === "demote") {
      const supers = await prisma.user.count({
        where: { id: { in: filteredIds }, role: "SUPER_ADMIN" },
      });
      if (supers > 0) {
        return errorResponse(
          "Não é possível rebaixar SUPER_ADMINs em lote — use a edição individual.",
          400
        );
      }
    }

    let result;
    switch (action) {
      case "block":
        result = await prisma.user.updateMany({
          where: { id: { in: filteredIds } },
          data: { isActive: false },
        });
        break;
      case "unblock":
        result = await prisma.user.updateMany({
          where: { id: { in: filteredIds } },
          data: { isActive: true },
        });
        break;
      case "promote":
        result = await prisma.user.updateMany({
          where: { id: { in: filteredIds } },
          data: { role: "ADMIN" },
        });
        break;
      case "demote":
        result = await prisma.user.updateMany({
          where: { id: { in: filteredIds } },
          data: { role: "USER" },
        });
        break;
    }

    await auditService.log(
      session.user.id,
      `USER_BULK_${action.toUpperCase()}`,
      "user",
      "bulk",
      { userIds: filteredIds, action, count: result.count }
    );

    return successResponse({ affected: result.count, action });
  } catch (error) {
    return handleApiError(error);
  }
}
