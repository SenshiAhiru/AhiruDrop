-- Steam trade URL on users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "steamTradeUrl" TEXT;

-- Trade status enum
DO $$ BEGIN
  CREATE TYPE "TradeStatus" AS ENUM ('PENDING', 'SENT', 'COMPLETED', 'FAILED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Trade requests table
CREATE TABLE IF NOT EXISTS "trade_requests" (
  "id"            TEXT PRIMARY KEY,
  "winnerId"      TEXT NOT NULL UNIQUE,
  "userId"        TEXT NOT NULL,
  "steamTradeUrl" TEXT NOT NULL,
  "status"        "TradeStatus" NOT NULL DEFAULT 'PENDING',
  "adminNotes"    TEXT,
  "sentAt"        TIMESTAMP(3),
  "completedAt"   TIMESTAMP(3),
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "trade_requests_winner_fkey"
    FOREIGN KEY ("winnerId") REFERENCES "winners"("id") ON DELETE CASCADE,
  CONSTRAINT "trade_requests_user_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "trade_requests_userId_idx" ON "trade_requests"("userId");
CREATE INDEX IF NOT EXISTS "trade_requests_status_idx" ON "trade_requests"("status");
