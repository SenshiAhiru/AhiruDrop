import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-utils";

// Cache exchange rates for 30 minutes
let ratesCache: Record<string, number> | null = null;
let ratesCacheTime = 0;
const CACHE_TTL = 30 * 60 * 1000;

// 1 AHC = 1 BRL always
const BASE_RATE_BRL = 1;

async function fetchRates(): Promise<Record<string, number>> {
  const now = Date.now();
  if (ratesCache && now - ratesCacheTime < CACHE_TTL) {
    return ratesCache;
  }

  try {
    // AwesomeAPI - free, no key needed, BRL base
    const res = await fetch(
      "https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,RUB-BRL,GBP-BRL",
      { signal: AbortSignal.timeout(10000) }
    );
    const data = await res.json();

    // data format: { USDBRL: { bid: "5.70" }, EURBRL: { bid: "6.20" }, ... }
    const rates: Record<string, number> = {
      BRL: 1, // 1 BRL = 1 AHC
      USD: parseFloat(data.USDBRL?.bid || "5.70"),  // 1 USD = X AHC
      EUR: parseFloat(data.EURBRL?.bid || "6.20"),  // 1 EUR = X AHC
      RUB: parseFloat(data.RUBBRL?.bid || "0.06"),  // 1 RUB = X AHC
      GBP: parseFloat(data.GBPBRL?.bid || "7.20"),  // 1 GBP = X AHC
    };

    ratesCache = rates;
    ratesCacheTime = now;
    return rates;
  } catch {
    // Fallback rates if API fails
    return ratesCache || {
      BRL: 1,
      USD: 5.70,
      EUR: 6.20,
      RUB: 0.06,
      GBP: 7.20,
    };
  }
}

export async function GET(req: NextRequest) {
  try {
    const rates = await fetchRates();

    return successResponse({
      base: "AHC",
      note: "1 AHC = 1 BRL. Other currencies show how many AHC per 1 unit.",
      rates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponse("Erro ao buscar cotações", 500);
  }
}
