import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/api-utils";
import { raffleService } from "@/services/raffle.service";
import type { RaffleStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const status = searchParams.get("status") as RaffleStatus | null;
    const search = searchParams.get("search") || undefined;
    const page = Number(searchParams.get("page") || "1");
    const limit = Math.min(Number(searchParams.get("limit") || "20"), 100);
    const featured = searchParams.get("featured");

    const result = await raffleService.list({
      status: status || "ACTIVE",
      search,
      page,
      limit,
      isFeatured: featured === "true" ? true : undefined,
    });

    return successResponse({
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: result.pages,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
