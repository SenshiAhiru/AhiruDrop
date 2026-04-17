-- Per-user coupon usage limit + redemption tracking

ALTER TABLE "coupons"
  ADD COLUMN IF NOT EXISTS "maxUsesPerUser" INTEGER;

CREATE TABLE IF NOT EXISTS "coupon_redemptions" (
  "id"          TEXT PRIMARY KEY,
  "couponId"    TEXT NOT NULL REFERENCES "coupons"("id") ON DELETE CASCADE,
  "userId"      TEXT NOT NULL,
  "context"     TEXT NOT NULL,
  "referenceId" TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "coupon_redemptions_couponId_userId_idx"
  ON "coupon_redemptions"("couponId", "userId");

CREATE INDEX IF NOT EXISTS "coupon_redemptions_userId_idx"
  ON "coupon_redemptions"("userId");
