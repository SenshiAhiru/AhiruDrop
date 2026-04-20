"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { pt } from "./messages/pt";
import { en } from "./messages/en";
import type { Locale, MessageKey } from "./types";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  LOCALES,
} from "./types";
import { detectLocaleFromNavigator } from "./detect";

const CATALOGS: Record<Locale, Record<MessageKey, string>> = {
  pt,
  en,
};

type Vars = Record<string, string | number>;

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MessageKey, vars?: Vars) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (k) => String(k),
});

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = vars[key];
    return v === undefined ? `{${key}}` : String(v);
  });
}

function writeCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? DEFAULT_LOCALE);

  // On mount, reconcile with localStorage (if set) > initial from server > navigator
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (stored && LOCALES.includes(stored)) {
        if (stored !== locale) {
          setLocaleState(stored);
          writeCookie(stored);
        }
        return;
      }
      // Server gave us something → trust it, just persist
      if (initialLocale && LOCALES.includes(initialLocale)) {
        localStorage.setItem(LOCALE_STORAGE_KEY, initialLocale);
        writeCookie(initialLocale);
        return;
      }
      // Nothing from server either → try navigator
      const nav = detectLocaleFromNavigator();
      if (nav && nav !== locale) {
        setLocaleState(nav);
        localStorage.setItem(LOCALE_STORAGE_KEY, nav);
        writeCookie(nav);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, l);
      writeCookie(l);
    } catch {}
    // Reflect on <html lang="..."> for accessibility
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", l === "pt" ? "pt-BR" : "en-US");
    }
  }, []);

  const t = useCallback(
    (key: MessageKey, vars?: Vars) => {
      const catalog = CATALOGS[locale] ?? CATALOGS[DEFAULT_LOCALE];
      const template = catalog[key] ?? CATALOGS[DEFAULT_LOCALE][key] ?? String(key);
      return interpolate(template, vars);
    },
    [locale]
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  return useContext(I18nContext);
}
