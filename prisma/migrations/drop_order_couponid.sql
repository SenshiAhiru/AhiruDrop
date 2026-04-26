-- Drop the dead Order.couponId column.
--
-- Coupons stopped applying to raffle orders weeks ago — they only attach to
-- deposits via CouponRedemption. The column has been NULL for every order
-- since that change and was kept "just in case", but the relation in the
-- Prisma schema started causing confusion.

-- Drop the FK constraint first (Postgres won't let us drop a referenced col).
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_couponId_fkey";

-- Then drop the column.
ALTER TABLE "orders" DROP COLUMN IF EXISTS "couponId";
