-- Mark users who registered BEFORE this feature as already onboarded
-- (so they don't see the tutorial). Only users created after this migration
-- will see the onboarding on first login.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboardedAt" TIMESTAMP(3);
UPDATE "users" SET "onboardedAt" = "createdAt" WHERE "onboardedAt" IS NULL;
