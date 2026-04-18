-- Track signup IP for anti-fraud (multi-account detection)

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "signupIp" TEXT;

CREATE INDEX IF NOT EXISTS "users_signupIp_idx"
  ON "users"("signupIp");
