import { NextRequest } from "next/server";
import { successResponse, handleApiError, requireAdmin } from "@/lib/api-utils";
import { auditService } from "@/services/audit.service";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;

    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "50")));

    const result = await auditService.list({
      page,
      limit,
      actorId: searchParams.get("actorId") || undefined,
      action: searchParams.get("action") || undefined,
      entityType: searchParams.get("entityType") || undefined,
      entityId: searchParams.get("entityId") || undefined,
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
