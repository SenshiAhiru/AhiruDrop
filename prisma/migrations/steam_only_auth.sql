-- Steam-only auth migration.
--
-- Steam OpenID is now the single login method. Steam doesn't hand us an
-- email or a password, so both columns become optional. Existing rows
-- keep their values; new Steam signups simply leave them NULL.
--
-- Postgres treats NULLs as distinct under a UNIQUE constraint, so the
-- existing unique index on email keeps working for the rows that have one.

ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- Optional cleanup (pre-launch, test accounts only): clear the synthetic
-- "@ahirudrop.steam" placeholder emails so Steam accounts show no email
-- until the user opts in to provide a real one. Safe because these were
-- never real addresses.
UPDATE "users"
  SET "email" = NULL
  WHERE "email" LIKE '%@ahirudrop.steam';
