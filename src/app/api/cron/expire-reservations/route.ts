import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const isProd = process.env.NODE_ENV === "production";

    // In production CRON_SECRET is REQUIRED. A missing secret used to leave
    // the endpoint open to anyone, which let outsiders trigger
    // releaseExpired() at will — DoS surface and premature reservation
    // releases in flight.
    if (isProd && !cronSecret) {
      console.error("CRON_SECRET is not set in production");
      return errorResponse("Cron not configured", 503);
    }

    // When set (any env), the bearer header MUST match.
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
