-- Provably Fair fields for Raffle (committed at creation)
ALTER TABLE "raffles"
  ADD COLUMN IF NOT EXISTS "serverSeedHash"      TEXT,
  ADD COLUMN IF NOT EXISTS "serverSeedEncrypted" TEXT,
  ADD COLUMN IF NOT EXISTS "drawBlockHeight"     INTEGER;

-- Provably Fair fields for RaffleDraw (revealed at draw)
ALTER TABLE "raffle_draws"
  ADD COLUMN IF NOT EXISTS "serverSeedRevealed" TEXT,
  ADD COLUMN IF NOT EXISTS "blockHash"          TEXT,
  ADD COLUMN IF NOT EXISTS "blockHeight"        INTEGER;
