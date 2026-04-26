/**
 * FX (foreign exchange) service
 *
 * AhiruDrop uses a fixed internal rate: 1 USD = AHC_PER_USD AHC.
 * For BRL-denominated payments, we convert via the live market rate
 * USD→BRL so the user sees the real cost in their local currency.
 *
 * USD→BRL is fetched live from a free public API (awesomeapi.com.br),
 * cached in-memory for 60s per serverless instance so we don't hammer
 * the provider on burst traffic.
 */

const AWESOMEAPI_URL = "https://economia.awesomeapi.com.br/last/USD-BRL";
const CACHE_TTL_MS = 60_000;
const MAX_STALE_MS = 60 * 60 * 1000; // 1h hard cap on stale cache reuse
const FALLBACK_USD_BRL = 5.5; // last-resort value if API fails

// Static platform rate: 1 AHC = $1 USD (parity)
export const AHC_PER_USD = 1;
export const USD_PER_AHC = 1;

type CacheEntry = {
  value: number;
  fetchedAt: number;
  source: "live" | "fallback";
};

let cached: CacheEntry | null = null;

async function fetchUsdToBrlLive(): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(AWESOMEAPI_URL, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = (await res.json()) as { USDBRL?: { bid?: string } };
    const bid = json?.USDBRL?.bid;
    if (!bid) return null;
    const num = Number(bid);
    if (!Number.isFinite(num) || num <= 0 || num > 100) return null;
    return num;
  } catch {
    return null;
  }
}

export const fxService = {
  /**
   * Current USD→BRL rate. Never throws — falls back to cached or hardcoded value.
   */
  async getUsdToBrl(): Promise<{ rate: number; fetchedAt: number; source: "live" | "fallback" | "cache" | "cache-stale" }> {
    const now = Date.now();
    if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
      return { rate: cached.value, fetchedAt: cached.fetchedAt, source: "cache" };
    }

    const live = await fetchUsdToBrlLive();
    if (live !== null) {
      cached = { value: live, fetchedAt: now, source: "live" };
      return { rate: live, fetchedAt: now, source: "live" };
    }

    // API failed. Reuse stale cache only if it's within the hard cap (1h).
    // Beyond that the rate is too unreliable to charge users — fall back to
    // the conservative hardcoded value and log so ops sees the degradation.
    if (cached && now - cached.fetchedAt < MAX_STALE_MS) {
      console.warn(
        `[fxService] using stale cache (age ${Math.round((now - cached.fetchedAt) / 1000)}s)`
      );
      return { rate: cached.value, fetchedAt: cached.fetchedAt, source: "cache-stale" };
    }
    if (cached) {
      console.error(
        `[fxService] cache too stale (>${MAX_STALE_MS}ms) and live fetch failed — using fallback`
      );
    }
    return { rate: FALLBACK_USD_BRL, fetchedAt: now, source: "fallback" };
  },

  /**
   * Convert an AHC amount to USD (always exact — fixed rate).
   */
  ahcToUsd(ahc: number): number {
    return ahc * USD_PER_AHC;
  },

  /**
   * Convert a USD amount to AHC (always exact — fixed rate).
   */
  usdToAhc(usd: number): number {
    return usd * AHC_PER_USD;
  },

  /**
   * Given an AHC amount and target currency, return how much the user
   * needs to pay in that currency and the FX rate used (if applicable).
   */
  async quote(ahcAmount: number, currency: "BRL" | "USD"): Promise<{
    ahcAmount: number;
    usdAmount: number;
    currency: "BRL" | "USD";
    payAmount: number;
    fxRate: number | null;
    fxSource: string;
  }> {
    const usdAmount = this.ahcToUsd(ahcAmount);
    if (currency === "USD") {
      return {
        ahcAmount,
        usdAmount,
        currency: "USD",
        payAmount: usdAmount,
        fxRate: null,
        fxSource: "none",
      };
    }
    const { rate, source } = await this.getUsdToBrl();
    const brlAmount = usdAmount * rate;
    // Round to 2 decimals for Stripe (cents)
    const payAmount = Math.round(brlAmount * 100) / 100;
    return {
      ahcAmount,
      usdAmount,
      currency: "BRL",
      payAmount,
      fxRate: rate,
      fxSource: source,
    };
  },
};
