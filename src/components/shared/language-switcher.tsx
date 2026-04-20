"use client";

import { useEffect, useRef, useState } from "react";
import { Languages, Check } from "lucide-react";
import { useTranslation } from "@/i18n/provider";
import { LOCALES, LOCALE_LABELS } from "@/i18n/types";
import type { Locale } from "@/i18n/types";

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

export function LanguageSwitcher({ className = "", compact = false }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function pick(l: Locale) {
    setLocale(l);
    setOpen(false);
  }

  const current = LOCALE_LABELS[locale];

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title={t("lang.switchTo")}
        aria-label={t("lang.switchTo")}
        className="flex items-center gap-1.5 rounded-full border border-surface-700 bg-surface-900/60 px-2.5 py-1.5 text-xs font-semibold text-surface-300 hover:border-primary-500/50 hover:text-white transition-colors"
      >
        <Languages className="h-4 w-4 text-surface-400" />
        {!compact && (
          <>
            <span className="text-sm">{current.flag}</span>
            <span>{current.short}</span>
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-surface-700 bg-surface-900 shadow-2xl shadow-black/40 overflow-hidden z-50 backdrop-blur-sm">
          <div className="px-3 py-2 border-b border-surface-800 text-[10px] font-bold uppercase tracking-wider text-surface-500">
            {t("lang.switchTo")}
          </div>
          <ul className="py-1">
            {LOCALES.map((l) => {
              const label = LOCALE_LABELS[l];
              const selected = l === locale;
              return (
                <li key={l}>
                  <button
                    type="button"
                    onClick={() => pick(l)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                      selected
                        ? "bg-primary-500/10 text-primary-300"
                        : "text-surface-300 hover:bg-surface-800 hover:text-white"
                    }`}
                  >
                    <span className="text-base">{label.flag}</span>
                    <span className="flex-1">{label.full}</span>
                    {selected && <Check className="h-3.5 w-3.5 text-primary-400" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
