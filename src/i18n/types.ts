import type { MessageKey } from "./messages/pt";

export type Locale = "pt" | "en";
export type { MessageKey };

export const LOCALES: Locale[] = ["pt", "en"];
export const DEFAULT_LOCALE: Locale = "pt";
export const LOCALE_COOKIE = "ahiru-locale";
export const LOCALE_STORAGE_KEY = "ahiru-locale";

export const LOCALE_LABELS: Record<Locale, { short: string; full: string; flag: string }> = {
  pt: { short: "PT", full: "Português", flag: "🇧🇷" },
  en: { short: "EN", full: "English", flag: "🇺🇸" },
};
