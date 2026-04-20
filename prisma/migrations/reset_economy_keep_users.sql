-- ──────────────────────────────────────────────────────────────────
-- RESET ECONÔMICO — AhiruDrop
-- ──────────────────────────────────────────────────────────────────
-- Remove todos os dados transacionais e rifas.
-- Mantém: contas de usuários, cupons (config), gateways, settings,
--         audit_logs.
-- Zera:   saldo de todos os usuários, currentUses dos cupons.
--
-- ⚠️  DESTRUTIVO E IRREVERSÍVEL.
--     Rode só depois de fazer backup no Supabase (Database → Backups).
--
-- Execute por inteiro (BEGIN/COMMIT garantem atomicidade).
-- ──────────────────────────────────────────────────────────────────

BEGIN;

-- 1. Trocas Steam e winners (dependem de raffle_draw)
DELETE FROM "trade_requests";
DELETE FROM "winners";

-- 2. Sorteios
DELETE FROM "raffle_draws";

-- 3. Pagamentos das rifas
DELETE FROM "payment_logs";
DELETE FROM "payments";

-- 4. Ordens
DELETE FROM "order_items";
DELETE FROM "raffle_numbers";
DELETE FROM "orders";

-- 5. Rifas (imagens primeiro pelo FK)
DELETE FROM "raffle_images";
DELETE FROM "raffles";

-- 6. Depósitos e resgates de cupom
DELETE FROM "deposits";
DELETE FROM "coupon_redemptions";

-- 7. Notificações e suporte
DELETE FROM "notifications";
DELETE FROM "support_messages";
DELETE FROM "support_tickets";

-- 8. Zera saldo de todos os usuários
UPDATE "users"
SET "balance" = 0,
    "updatedAt" = NOW();

-- 9. Zera contador de uso dos cupons (continuam ativos com config preservada)
UPDATE "coupons"
SET "currentUses" = 0,
    "updatedAt" = NOW();

-- ──────────────────────────────────────────────────────────────────
-- Verificação pós-reset (retorna contagens; esperado: 0 em tudo exceto
-- users, coupons, payment_gateways, system_settings, audit_logs)
-- ──────────────────────────────────────────────────────────────────
SELECT 'users'              AS tabela, COUNT(*) AS rows FROM "users"
UNION ALL SELECT 'coupons',              COUNT(*) FROM "coupons"
UNION ALL SELECT 'payment_gateways',     COUNT(*) FROM "payment_gateways"
UNION ALL SELECT 'audit_logs',           COUNT(*) FROM "audit_logs"
UNION ALL SELECT 'system_settings',      COUNT(*) FROM "system_settings"
UNION ALL SELECT 'raffles (esperado 0)', COUNT(*) FROM "raffles"
UNION ALL SELECT 'orders (esperado 0)',  COUNT(*) FROM "orders"
UNION ALL SELECT 'deposits (esperado 0)',COUNT(*) FROM "deposits"
UNION ALL SELECT 'winners (esperado 0)', COUNT(*) FROM "winners"
ORDER BY tabela;

COMMIT;
