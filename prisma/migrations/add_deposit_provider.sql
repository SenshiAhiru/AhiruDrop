-- Add provider column to deposits to support multiple gateways (Stripe + Mercado Pago).

ALTER TABLE "deposits"
  ADD COLUMN IF NOT EXISTS "provider" TEXT NOT NULL DEFAULT 'stripe';
