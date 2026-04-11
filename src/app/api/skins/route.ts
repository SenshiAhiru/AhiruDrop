import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-utils";

// Cache skins data for 24 hours
let skinsCache: any[] | null = null;
let skinsCacheTime = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000;

const SKINS_URL =
  "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json";

async function fetchSkins() {
  const now = Date.now();
  if (skinsCache && now - skinsCacheTime < CACHE_TTL) {
    return skinsCache;
  }

  const res = await fetch(SKINS_URL, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Failed to fetch skins: ${res.status}`);
  const data = await res.json();

  const skins = data.map((skin: any) => ({
    id: skin.id,
    name: skin.name,
    weapon: skin.weapon?.name || "",
    pattern: skin.pattern?.name || "",
    category: skin.category?.name || "",
    rarity: skin.rarity?.name || "",
    rarityColor: skin.rarity?.color || "#b0c3d9",
    image: skin.image,
    minFloat: skin.min_float ?? 0,
    maxFloat: skin.max_float ?? 1,
    stattrak: skin.stattrak || false,
    souvenir: skin.souvenir || false,
    wears: (skin.wears || []).map((w: any) => w.name),
  }));

  skinsCache = skins;
  skinsCacheTime = now;
  return skins;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.toLowerCase().trim() || "";
    const type = searchParams.get("type")?.toLowerCase() || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100);

    const allSkins = await fetchSkins();
    let filtered = allSkins;

    if (type) {
      filtered = filtered.filter(
        (s: any) => s.category.toLowerCase() === type.toLowerCase()
      );
    }

    if (q && q.length >= 2) {
      filtered = filtered.filter(
        (s: any) =>
          s.name.toLowerCase().includes(q) ||
          s.weapon.toLowerCase().includes(q) ||
          s.pattern.toLowerCase().includes(q)
      );
    }

    return successResponse(filtered.slice(0, limit));
  } catch (error) {
    console.error("Skins API error:", error);
    if (skinsCache) {
      return successResponse(skinsCache.slice(0, 30));
    }
    return errorResponse("Failed to fetch skins", 500);
  }
}
