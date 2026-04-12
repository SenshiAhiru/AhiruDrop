import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { raffleService } from "@/services/raffle.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ raffleId: string }> }
) {
  try {
    const { raffleId } = await params;

    const numbers = await raffleService.getNumbers(raffleId);

    if (!numbers) {
      return errorResponse("Rifa não encontrada", 404);
    }

    const mapped = numbers.map((n) => ({
      number: n.number,
      status: n.status,
    }));

    return successResponse(mapped);
  } catch (error) {
    return handleApiError(error);
  }
}
