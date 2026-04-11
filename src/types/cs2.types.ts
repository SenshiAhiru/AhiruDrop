export interface CS2Skin {
  id: string;
  name: string;            // "AK-47 | Asiimov"
  description: string;
  weapon: {
    id: string;
    name: string;          // "AK-47"
    category: string;      // "Rifle"
  };
  pattern: {
    id: string;
    name: string;          // "Asiimov"
  };
  rarity: {
    id: string;
    name: string;          // "Covert"
    color: string;         // "#eb4b4b"
  };
  image: string;           // URL to skin image
  min_float: number;       // 0.00
  max_float: number;       // 1.00
  stattrak: boolean;
  souvenir: boolean;
  paint_index: string;
}

export interface CS2SkinSearchResult {
  id: string;
  name: string;
  weapon: string;
  pattern: string;
  category: string;
  rarity: string;
  rarityColor: string;
  image: string;
  minFloat: number;
  maxFloat: number;
  stattrak: boolean;
  souvenir: boolean;
  marketPrice?: number;    // Price in BRL
}

export interface SkinSelection {
  skinName: string;
  skinImage: string;
  skinWeapon: string;
  skinCategory: string;
  skinRarity: string;
  skinRarityColor: string;
  skinWear: string;
  skinFloat: number | null;
  skinStatTrak: boolean;
  skinSouvenir: boolean;
  skinExteriorMin: number;
  skinExteriorMax: number;
  skinMarketPrice: number | null;
}
