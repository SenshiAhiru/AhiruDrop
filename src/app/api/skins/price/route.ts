import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api-utils";

// Cache prices for 1 hour
const priceCache = new Map<string, { price: number; time: number }>();
const PRICE_CACHE_TTL = 60 * 60 * 1000; // 1h

export async function GET(req: NextRequest) {
  try {
    // Admin-only: this proxies uncached queries to Steam Market
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const skinName = searchParams.get("name");
    const wear = searchParams.get("wear") || "";
    const stattrak = searchParams.get("stattrak") === "true";

    if (!skinName) {
      return errorResponse("Skin name is required", 400);
    }

    // Build market hash name
    let marketName = skinName;
    if (wear) {
      marketName = `${skinName} (${wear})`;
    }
    if (stattrak) {
      // StatTrak prefix goes before weapon name
      const parts = marketName.split(" | ");
      if (parts.length === 2) {
        marketName = `StatTrak\u2122 ${marketName}`;
      }
    }

    // Check cache
    const cached = priceCache.get(marketName);
    if (cached && Date.now() - cached.time < PRICE_CACHE_TTL) {
      return successResponse({ price: cached.price, currency: "BRL", name: marketName });
    }

    // Fetch from Steam Market
    const encoded = encodeURIComponent(marketName);
    const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=7&market_hash_name=${encoded}`;

    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return successResponse({ price: null, currency: "BRL", name: marketName, error: "Price not available" });
    }

    const data = await res.json();

    // Steam returns price as string like "R$ 1.234,56"
    let price: number | null = null;
    const priceStr = data.lowest_price || data.median_price;
    if (priceStr) {
      // Parse "R$ 1.234,56" format
      price = parseFloat(
        priceStr.replace("R$ ", "").replace(/\./g, "").replace(",", ".")
      );
    }

    if (price !== null) {
      priceCache.set(marketName, { price, time: Date.now() });
    }

    return successResponse({
      price,
      currency: "BRL",
      name: marketName,
      lowestPrice: data.lowest_price,
      medianPrice: data.median_price,
      volume: data.volume,
    });
  } catch (error) {
    console.error("Price API error:", error);
    return successResponse({ price: null, currency: "BRL", error: "Failed to fetch price" });
  }
}
