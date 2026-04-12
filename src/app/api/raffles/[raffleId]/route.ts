import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { raffleService } from "@/services/raffle.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ raffleId: string }> }
) {
  try {
    const { raffleId } = await params;

    // Try slug first, then ID
    let raffle = await raffleService.getBySlug(raffleId);
    if (!raffle) {
      raffle = await raffleService.getById(raffleId);
    }

    if (!raffle) {
      return errorResponse("Rifa não encontrada", 404);
    }

    return successResponse(raffle);
  } catch (error) {
    return handleApiError(error);
  }
}
