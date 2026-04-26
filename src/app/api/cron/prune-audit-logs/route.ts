import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { log, error as logError } from "@/lib/logger";

/**
 * Audit log retention.
 *
 * audit_logs grows monotonically. Without retention, it eventually
 * dominates DB size. We keep 12 months by default — enough for any
 * reasonable post-incident review and well within compliance norms for
 * a non-financial platform.
 *
 * Recommended schedule: weekly (Sunday 03:00 BRT).
 */

const RETENTION_MONTHS = 12;

export async function GET(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const isProd = process.env.NODE_ENV === "production";

    if (isProd && !cronSecret) {
      logError("CRON_SECRET is not set in production");
      return errorResponse("Cron not configured", 503);
    }
    if (cronSecret) {
      const authHeader = req.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        return errorResponse("Unauthorized", 401);
      }
    }

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - RETENTION_MONTHS);

    const result = await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    log(`[prune-audit-logs] Deleted ${result.count} rows older than ${cutoff.toISOString()}`);

    return successResponse({
      deleted: result.count,
      cutoff: cutoff.toISOString(),
      retentionMonths: RETENTION_MONTHS,
    });
  } catch (err) {
    logError("Audit log prune error:", err);
    return errorResponse("Failed to prune audit logs", 500);
  }
}
