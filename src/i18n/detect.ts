import type { Locale } from "./types";

/**
 * Parse the browser's Accept-Language header into our supported Locales.
 * Returns the best match or null if no confidence.
 */
export function detectLocaleFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const parts = header.split(",").map((part) => {
    const [tag, ...params] = part.trim().split(";");
    const qParam = params.find((p) => p.trim().startsWith("q="));
    const q = qParam ? parseFloat(qParam.split("=")[1]) || 0 : 1;
    return { tag: tag.toLowerCase(), q };
  });

  parts.sort((a, b) => b.q - a.q);

  for (const { tag } of parts) {
    if (tag.startsWith("pt")) return "pt";
    if (tag.startsWith("en")) return "en";
  }

  return null;
}

/**
 * Navigator-based detection (client side) — checks navigator.language
 * and falls back to Accept-Language equivalents.
 */
export function detectLocaleFromNavigator(): Locale | null {
  if (typeof navigator === "undefined") return null;
  const langs = (navigator.languages ?? [navigator.language]).filter(Boolean);
  for (const l of langs) {
    const lower = l.toLowerCase();
    if (lower.startsWith("pt")) return "pt";
    if (lower.startsWith("en")) return "en";
  }
  return null;
}
