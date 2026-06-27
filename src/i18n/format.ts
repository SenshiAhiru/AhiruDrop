/**
 * Locale-aware date / number formatting.
 *
 * Centralizes the pt-BR ↔ en-US Intl locale mapping so UI code never hardcodes
 * `"pt-BR"` in toLocaleString/toLocaleDateString — pass the active `locale`
 * (from useTranslation on the client, or getServerLocale on the server) and
 * dates/numbers follow the user's chosen language.
 */
import type { Locale } from "./types";

const INTL_LOCALE: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en-US",
};

export function intlLocale(locale: Locale): string {
  return INTL_LOCALE[locale] ?? "pt-BR";
}

export function formatDate(
  date: Date | string | number,
  locale: Locale,
  opts?: Intl.DateTimeFormatOptions
): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString(intlLocale(locale), opts);
}

export function formatDateTime(
  date: Date | string | number,
  locale: Locale,
  opts?: Intl.DateTimeFormatOptions
): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleString(intlLocale(locale), opts);
}

export function formatNumber(
  n: number,
  locale: Locale,
  opts?: Intl.NumberFormatOptions
): string {
  return n.toLocaleString(intlLocale(locale), opts);
}
