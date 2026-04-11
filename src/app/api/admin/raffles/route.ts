import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAdmin,
  validateBody,
} from "@/lib/api-utils";
import { raffleService } from "@/services/raffle.service";
import { auditService } from "@/services/audit.service";
import { createRaffleSchema } from "@/validators/raffle.validator";
import type { RaffleStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;

    const status = searchParams.get("status") as RaffleStatus | null;
    const search = searchParams.get("search") || undefined;
    const page = Number(searchParams.get("page") || "1");
    const limit = Math.min(Number(searchParams.get("limit") || "20"), 100);

    const result = await raffleService.list({
      status: status || undefined,
      search,
      page,
      limit,
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

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const { data, error } = await validateBody(req, createRaffleSchema);

    if (error) {
      return errorResponse(error, 422);
    }

    const raffle = await raffleService.create(data!);

    await auditService.log(
      session.user.id,
      "RAFFLE_CREATED",
      "raffle",
      raffle.id,
      { title: raffle.title }
    );

    return successResponse(raffle, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
