-- 7-day login rewards: one-shot per user

CREATE TABLE IF NOT EXISTS "daily_rewards" (
  "id"        TEXT PRIMARY KEY,
  "userId"    TEXT NOT NULL,
  "day"       INTEGER NOT NULL,
  "ahcReward" DECIMAL(10,2) NOT NULL,
  "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "daily_rewards_userId_day_key" UNIQUE ("userId", "day"),
  CONSTRAINT "daily_rewards_day_range" CHECK ("day" BETWEEN 1 AND 7)
);

CREATE INDEX IF NOT EXISTS "daily_rewards_userId_idx"
  ON "daily_rewards"("userId");
