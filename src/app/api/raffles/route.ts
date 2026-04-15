import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/api-utils";
import { raffleService } from "@/services/raffle.service";
import type { RaffleStatus } from "@prisma/client";

const PUBLIC_VISIBLE: RaffleStatus[] = ["ACTIVE", "CLOSED"];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const statusParam = searchParams.get("status");
    const statusesParam = searchParams.get("statuses"); // comma-separated
    const search = searchParams.get("search") || undefined;
    const page = Number(searchParams.get("page") || "1");
    const limit = Math.min(Number(searchParams.get("limit") || "20"), 100);
    const featured = searchParams.get("featured");

    // Resolve which statuses to show
    let statuses: RaffleStatus[] | undefined;
    let status: RaffleStatus | undefined;

    if (statusesParam) {
      statuses = statusesParam
        .split(",")
        .map((s) => s.trim().toUpperCase() as RaffleStatus)
        .filter((s) => s);
    } else if (statusParam) {
      status = statusParam as RaffleStatus;
    } else {
      // Default public visibility: ACTIVE + CLOSED (aguardando sorteio)
      statuses = PUBLIC_VISIBLE;
    }

    const result = await raffleService.list({
      status,
      statuses,
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
