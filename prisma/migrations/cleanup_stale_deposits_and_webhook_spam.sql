-- One-time cleanup for the webhook-health false positives.
--
-- Context: the webhook-health cron flagged every PENDING deposit older than
-- 15min with no upper bound, so abandoned test checkouts (never paid, stuck in
-- PENDING) triggered a fresh admin notification every day. The cron is now
-- windowed to the last 24h, but the existing stuck rows + spam still need to go.
--
-- Safe for pre-launch (test accounts only). Review the SELECT first if unsure.

-- 1. Inspect what will be affected (optional — run this first to eyeball it):
-- SELECT id, "userId", currency, "amountPaid", status, "createdAt"
-- FROM "deposits"
-- WHERE status = 'PENDING' AND "createdAt" < now() - interval '24 hours';

-- 2. Mark long-abandoned PENDING deposits (>24h, never completed) as FAILED so
--    they stop matching the health check.
UPDATE "deposits"
SET status = 'FAILED', "updatedAt" = now()
WHERE status = 'PENDING'
  AND "createdAt" < now() - interval '24 hours';

-- 3. Delete the accumulated webhook-health spam notifications.
DELETE FROM "notifications"
WHERE type = 'SYSTEM'
  AND title = 'Webhook Stripe possivelmente fora do ar';
