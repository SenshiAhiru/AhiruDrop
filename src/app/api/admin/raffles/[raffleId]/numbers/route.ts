import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAdmin,
} from "@/lib/api-utils";
import { raffleService } from "@/services/raffle.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ raffleId: string }> }
) {
  try {
    await requireAdmin();
    const { raffleId } = await params;

    const numbers = await raffleService.getNumbers(raffleId);

    if (!numbers) {
      return errorResponse("Rifa nao encontrada", 404);
    }

    return successResponse(numbers);
  } catch (error) {
    return handleApiError(error);
  }
}
