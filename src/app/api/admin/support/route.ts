import { NextRequest } from "next/server";
import { successResponse, handleApiError, requireAdmin } from "@/lib/api-utils";
import { supportService } from "@/services/support.service";
import type { TicketStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;

    const status = searchParams.get("status") as TicketStatus | null;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "50")));

    const result = await supportService.listAll({
      status: status || undefined,
      category,
      search,
      page,
      limit,
    });

    const openCount = await supportService.countOpenForAdmin();

    return successResponse({ ...result, openCount });
  } catch (error) {
    return handleApiError(error);
  }
}
