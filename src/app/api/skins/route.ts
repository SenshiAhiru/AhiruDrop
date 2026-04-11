import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-utils";

// Cache skins data for 24 hours
let skinsCache: any[] | null = null;
let skinsCacheTime = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

async function fetchSkins() {
  const now = Date.now();
  if (skinsCache && now - skinsCacheTime < CACHE_TTL) {
    return skinsCache;
  }

  try {
    const res = await fetch(
      "https://bymykel.github.io/CSGO-API/api/en/skins.json",
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) throw new Error("Failed to fetch skins");
    const data = await res.json();

    // Transform to our format
    const skins = data.map((skin: any) => ({
      id: skin.id,
      name: skin.name,
      weapon: skin.weapon?.name || "",
      pattern: skin.pattern?.name || "",
      category: skin.category?.name || skin.weapon?.category?.name || "",
      rarity: skin.rarity?.name || "",
      rarityColor: skin.rarity?.color || "#b0c3d9",
      image: skin.image,
      minFloat: skin.min_float ?? 0,
      maxFloat: skin.max_float ?? 1,
      stattrak: skin.stattrak || false,
      souvenir: skin.souvenir || false,
    }));

    skinsCache = skins;
    skinsCacheTime = now;
    return skins;
  } catch (error) {
    if (skinsCache) return skinsCache; // Return stale cache on error
    throw error;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.toLowerCase() || "";
    const type = searchParams.get("type") || ""; // "Rifle", "Knife", "Gloves", etc
    const limit = parseInt(searchParams.get("limit") || "30");

    const allSkins = await fetchSkins();

    let filtered = allSkins;

    // Filter by category type
    if (type) {
      filtered = filtered.filter((s: any) =>
        s.category.toLowerCase().includes(type.toLowerCase())
      );
    }

    // Filter by search query
    if (q) {
      filtered = filtered.filter((s: any) =>
        s.name.toLowerCase().includes(q) ||
        s.weapon.toLowerCase().includes(q) ||
        s.pattern.toLowerCase().includes(q)
      );
    }

    // Limit results
    const results = filtered.slice(0, limit);

    return successResponse(results);
  } catch (error) {
    console.error("Skins API error:", error);
    return errorResponse("Failed to fetch skins", 500);
  }
}
