-- Enable Row Level Security on all public tables
--
-- Context: Supabase Security Advisor flags public tables without RLS as
-- errors by default. AhiruDrop accesses Postgres exclusively through
-- Prisma using the postgres role (via DATABASE_URL pooler), which bypasses
-- RLS. So turning RLS on without adding policies:
--   - does NOT break anything that goes through Prisma
--   - DOES block any accidental anon/authenticated access (defense in
--     depth, in case someone ever adds a Supabase JS client on the front)
--
-- If we later need to expose a table to the browser via Supabase directly,
-- we'll add an explicit policy at that time.

ALTER TABLE "users"                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "raffles"                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "raffle_images"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "raffle_numbers"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders"                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payment_logs"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payment_gateways"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payment_gateway_configs"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "coupons"                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "coupon_redemptions"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "raffle_draws"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "winners"                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "trade_requests"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "support_tickets"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "support_messages"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "system_settings"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "deposits"                 ENABLE ROW LEVEL SECURITY;
-- Run after add_daily_rewards_table.sql if applicable:
-- ALTER TABLE "daily_rewards" ENABLE ROW LEVEL SECURITY;
