import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { notificationService } from "@/services/notification.service";
import { warn, error as logError } from "@/lib/logger";

/**
 * Webhook health cron.
 *
 * If the Stripe webhook stops working (misconfigured endpoint, signing-secret
 * rotated without updating us, Vercel routing broken, etc.), users continue
 * to pay but their AHC balance is never credited. There's no in-product
 * signal — the deposit just sits in PENDING. This cron flags that.
 *
 * Logic: any Deposit row stuck in PENDING for more than 15 minutes
 * indicates a delivery/processing problem worth investigating. We notify
 * admins (in-app) and log a warn so the Vercel dashboard surfaces it.
 *
 * Recommended schedule: every 10 minutes.
 */

const STALE_THRESHOLD_MS = 15 * 60 * 1000;

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

    const cutoff = new Date(Date.now() - STALE_THRESHOLD_MS);
    const stale = await prisma.deposit.findMany({
      where: { status: "PENDING", createdAt: { lt: cutoff } },
      select: {
        id: true,
        userId: true,
        paymentIntentId: true,
        currency: true,
        amountPaid: true,
        ahcTotal: true,
        createdAt: true,
      },
      take: 50,
    });

    if (stale.length === 0) {
      return successResponse({ healthy: true, staleCount: 0 });
    }

    warn(
      `[webhook-health] Detected ${stale.length} deposits stuck in PENDING for >${STALE_THRESHOLD_MS / 60000}min — Stripe webhook may be down`
    );

    // Notify admins once per stale deposit (best-effort; the
    // notification table doesn't enforce dedup, but this cron only fires
    // every ~10min so spam is bounded).
    try {
      const { auditService } = await import("@/services/audit.service");
      // Find a SUPER_ADMIN to use as the actor for the audit log
      const sysActor = await prisma.user.findFirst({
        where: { role: "SUPER_ADMIN" },
        select: { id: true },
      });
      if (sysActor) {
        await auditService.log(
          sysActor.id,
          "WEBHOOK_HEALTH_DEGRADED",
          "deposit",
          "bulk",
          {
            staleCount: stale.length,
            sampleIds: stale.slice(0, 5).map((d) => d.id),
            thresholdMs: STALE_THRESHOLD_MS,
          }
        );
      }

      // In-app notification to admin users
      const admins = await prisma.user.findMany({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] }, isActive: true },
        select: { id: true },
      });
      for (const a of admins) {
        try {
          await notificationService.create(
            a.id,
            "SYSTEM",
            "Webhook Stripe possivelmente fora do ar",
            `${stale.length} depósito(s) parado(s) em PENDING há mais de ${STALE_THRESHOLD_MS / 60000} minutos. Verifique a configuração do webhook no painel do Stripe.`,
            { staleCount: stale.length, link: "/admin/orders" }
          );
        } catch {}
      }
    } catch (err) {
      logError("[webhook-health] failed to notify admins:", err);
    }

    return successResponse({
      healthy: false,
      staleCount: stale.length,
      sample: stale.slice(0, 5).map((d) => ({
        id: d.id,
        paymentIntentId: d.paymentIntentId,
        ageMin: Math.round((Date.now() - d.createdAt.getTime()) / 60000),
      })),
    });
  } catch (err) {
    logError("Webhook health cron error:", err);
    return errorResponse("Failed to check webhook health", 500);
  }
}
