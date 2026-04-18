-- Store bonus AHC directly on the redemption row (avoids Deposit JOIN)

ALTER TABLE "coupon_redemptions"
  ADD COLUMN IF NOT EXISTS "bonusAhc" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Backfill from existing deposits when possible (referenceId = paymentIntentId)
UPDATE "coupon_redemptions" cr
SET "bonusAhc" = d."ahcBonus"
FROM "deposits" d
WHERE cr."referenceId" = d."paymentIntentId"
  AND cr."bonusAhc" = 0
  AND d."ahcBonus" > 0;
