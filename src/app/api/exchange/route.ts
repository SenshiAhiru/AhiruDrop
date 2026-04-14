import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api-utils";

// Fixed 1:1 rates for all major currencies
// 1 AHC = 1 unit of any currency
const FIXED_RATES: Record<string, number> = {
  BRL: 1,
  USD: 1,
  EUR: 1,
  GBP: 1,
  RUB: 1,
};

export async function GET(req: NextRequest) {
  return successResponse({
    base: "AHC",
    note: "1 AHC = 1 unit of any supported currency",
    rates: FIXED_RATES,
    updatedAt: new Date().toISOString(),
  });
}
