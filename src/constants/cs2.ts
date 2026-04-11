export const CS2_WEAR_CONDITIONS = [
  { value: "Factory New", shortName: "FN", floatMin: 0.00, floatMax: 0.07, color: "#4ade80" },
  { value: "Minimal Wear", shortName: "MW", floatMin: 0.07, floatMax: 0.15, color: "#a3e635" },
  { value: "Field-Tested", shortName: "FT", floatMin: 0.15, floatMax: 0.38, color: "#facc15" },
  { value: "Well-Worn", shortName: "WW", floatMin: 0.38, floatMax: 0.45, color: "#fb923c" },
  { value: "Battle-Scarred", shortName: "BS", floatMin: 0.45, floatMax: 1.00, color: "#ef4444" },
] as const;

export type WearCondition = (typeof CS2_WEAR_CONDITIONS)[number]["value"];

export const CS2_CATEGORIES = [
  { value: "Rifle", label: "Rifles" },
  { value: "Pistol", label: "Pistolas" },
  { value: "SMG", label: "SMGs" },
  { value: "Shotgun", label: "Escopetas" },
  { value: "Machinegun", label: "Metralhadoras" },
  { value: "Sniper Rifle", label: "Snipers" },
  { value: "Knife", label: "Facas" },
  { value: "Gloves", label: "Luvas" },
] as const;

export type SkinCategory = (typeof CS2_CATEGORIES)[number]["value"];

export const CS2_RARITIES = [
  { value: "Consumer Grade", color: "#b0c3d9", label: "Consumidor" },
  { value: "Industrial Grade", color: "#5e98d9", label: "Industrial" },
  { value: "Mil-Spec Grade", color: "#4b69ff", label: "Mil-Spec" },
  { value: "Restricted", color: "#8847ff", label: "Restrito" },
  { value: "Classified", color: "#d32ce6", label: "Classificado" },
  { value: "Covert", color: "#eb4b4b", label: "Secreto" },
  { value: "Contraband", color: "#e4ae39", label: "Contrabando" },
  { value: "Extraordinary", color: "#e4ae39", label: "Extraordinario" },
] as const;

export function getWearFromFloat(float: number): WearCondition {
  if (float <= 0.07) return "Factory New";
  if (float <= 0.15) return "Minimal Wear";
  if (float <= 0.38) return "Field-Tested";
  if (float <= 0.45) return "Well-Worn";
  return "Battle-Scarred";
}

export function getWearColor(wear: string): string {
  return CS2_WEAR_CONDITIONS.find(w => w.value === wear)?.color ?? "#9ca3af";
}

export function getRarityColor(rarity: string): string {
  return CS2_RARITIES.find(r => r.value === rarity)?.color ?? "#b0c3d9";
}

export function getWearShortName(wear: string): string {
  return CS2_WEAR_CONDITIONS.find(w => w.value === wear)?.shortName ?? "??";
}
