-- Add optional English translation columns to raffles.
--
-- All nullable: existing rifas keep working untouched (renderer falls
-- back to the PT field when the EN equivalent is null). New rifas can
-- be filled in via the admin form's EN tab.

ALTER TABLE "raffles"
  ADD COLUMN IF NOT EXISTS "titleEn"            TEXT,
  ADD COLUMN IF NOT EXISTS "descriptionEn"      TEXT,
  ADD COLUMN IF NOT EXISTS "shortDescriptionEn" TEXT,
  ADD COLUMN IF NOT EXISTS "regulationEn"       TEXT;
