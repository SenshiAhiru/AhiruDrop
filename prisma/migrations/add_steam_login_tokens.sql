-- Dedicated table for Steam OIDC one-shot login tokens.
-- Replaces SystemSetting "steam_token:*" entries which (a) had no TTL and
-- (b) were writable by admins via PATCH /api/admin/settings — letting an
-- admin forge a token that authenticates as any user.

CREATE TABLE IF NOT EXISTS "steam_login_tokens" (
  "id"         TEXT PRIMARY KEY,
  "token"      TEXT NOT NULL UNIQUE,
  "userId"     TEXT NOT NULL,
  "expiresAt"  TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "steam_login_tokens_userId_idx"
  ON "steam_login_tokens"("userId");

CREATE INDEX IF NOT EXISTS "steam_login_tokens_expiresAt_idx"
  ON "steam_login_tokens"("expiresAt");

-- Optional cleanup: remove stale SystemSetting entries from the old scheme
DELETE FROM "system_settings" WHERE "key" LIKE 'steam_token:%';
