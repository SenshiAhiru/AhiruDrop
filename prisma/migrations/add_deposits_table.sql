-- Deposit history tracking

CREATE TABLE IF NOT EXISTS "deposits" (
  "id"              TEXT PRIMARY KEY,
  "userId"          TEXT NOT NULL,
  "paymentIntentId" TEXT NOT NULL UNIQUE,
  "currency"        TEXT NOT NULL,
  "amountPaid"      DECIMAL(10,2) NOT NULL,
  "ahcBase"         DECIMAL(10,2) NOT NULL,
  "ahcBonus"        DECIMAL(10,2) NOT NULL DEFAULT 0,
  "ahcTotal"        DECIMAL(10,2) NOT NULL,
  "couponId"        TEXT,
  "couponCode"      TEXT,
  "status"          TEXT NOT NULL DEFAULT 'PENDING',
  "completedAt"     TIMESTAMP(3),
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "deposits_userId_createdAt_idx"
  ON "deposits"("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "deposits_status_idx"
  ON "deposits"("status");

CREATE INDEX IF NOT EXISTS "deposits_paymentIntentId_idx"
  ON "deposits"("paymentIntentId");
