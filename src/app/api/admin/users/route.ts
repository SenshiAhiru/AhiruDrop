import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAdmin,
  validateBody,
} from "@/lib/api-utils";
import { userService } from "@/services/user.service";
import { auditService } from "@/services/audit.service";
import { updateUserSchema } from "@/validators/admin.validator";
import type { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;

    const role = searchParams.get("role") as Role | null;
    const search = searchParams.get("search") || undefined;
    const page = Number(searchParams.get("page") || "1");
    const limit = Math.min(Number(searchParams.get("limit") || "50"), 100);
    const isActiveParam = searchParams.get("isActive");
    const isActive =
      isActiveParam === "true" ? true : isActiveParam === "false" ? false : undefined;

    const validSortFields = new Set([
      "name",
      "email",
      "balance",
      "createdAt",
      "totalSpent",
      "orderCount",
      "winCount",
    ]);
    const sortByRaw = searchParams.get("sortBy") || "createdAt";
    const sortBy = (validSortFields.has(sortByRaw) ? sortByRaw : "createdAt") as any;
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const result = await userService.listAll({
      role: role || undefined,
      search,
      page,
      limit,
      isActive,
      sortBy,
      sortOrder,
    });

    return successResponse(result);
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

    const { userId, ...updateData } = body;

    if (!userId) {
      return errorResponse("userId é obrigatório", 422);
    }

    // Validate the update fields
    const result = updateUserSchema.safeParse(updateData);
    if (!result.success) {
      const firstIssue = result.error.issues?.[0]?.message ?? "Dados inválidos";
      return errorResponse(firstIssue, 422);
    }

    const { prisma } = await import("@/lib/prisma");
    const updated = await prisma.user.update({
      where: { id: userId },
      data: result.data as any,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await auditService.log(
      session.user.id,
      "USER_UPDATED",
      "user",
      userId,
      { changes: result.data }
    );

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
