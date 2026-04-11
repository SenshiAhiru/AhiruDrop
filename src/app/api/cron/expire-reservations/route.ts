import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret if configured
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = req.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        return errorResponse("Unauthorized", 401);
      }
    }

    // Import lazily to avoid issues if DB not connected
    const { raffleNumberRepository } = await import("@/repositories/raffle-number.repository");

    const releasedCount = await raffleNumberRepository.releaseExpired();

    return successResponse({
      released: releasedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron error:", error);
    return errorResponse("Failed to expire reservations", 500);
  }
}
