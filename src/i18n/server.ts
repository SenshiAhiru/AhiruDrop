/**
 * Server-side i18n — for Server Components / route handlers / metadata that
 * can't use the client `useTranslation()` hook. Resolves the locale the same
 * way the root layout does (cookie → Accept-Language → default) and returns a
 * `t()` bound to the matching catalog.
 *
 *   const { t, locale } = await getServerT();
 *   <h1>{t("results.notFoundTitle")}</h1>
 */
import { cookies, headers } from "next/headers";
import { pt } from "./messages/pt";
import { en } from "./messages/en";
import type { Locale, MessageKey } from "./types";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES } from "./types";
import { detectLocaleFromAcceptLanguage } from "./detect";

const CATALOGS: Record<Locale, Record<MessageKey, string>> = { pt, en };

type Vars = Record<string, string | number>;

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = vars[key];
    return v === undefined ? `{${key}}` : String(v);
  });
}

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieVal = cookieStore.get(LOCALE_COOKIE)?.value as Locale | undefined;
  if (cookieVal && LOCALES.includes(cookieVal)) return cookieVal;

  const headerStore = await headers();
  const fromHeader = detectLocaleFromAcceptLanguage(
    headerStore.get("accept-language")
  );
  if (fromHeader) return fromHeader;

  return DEFAULT_LOCALE;
}

export async function getServerT(): Promise<{
  locale: Locale;
  t: (key: MessageKey, vars?: Vars) => string;
}> {
  const locale = await getServerLocale();
  const catalog = CATALOGS[locale] ?? CATALOGS[DEFAULT_LOCALE];
  const t = (key: MessageKey, vars?: Vars) => {
    const template =
      catalog[key] ?? CATALOGS[DEFAULT_LOCALE][key] ?? String(key);
    return interpolate(template, vars);
  };
  return { locale, t };
}
