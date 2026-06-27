"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { useTranslation } from "@/i18n/provider";

const STORAGE_KEY = "ahiru-cookie-consent";

/**
 * LGPD cookie notice — informational (not a blocking consent gate).
 *
 * The site only sets essential/functional cookies (NextAuth session + locale)
 * and uses cookieless analytics (Vercel), so there's no non-essential tracking
 * to gate behind opt-in. This is a transparency notice: inform the user, link
 * to the privacy policy, and remember the acknowledgment in localStorage.
 */
export function CookieConsent() {
  const { t } = useTranslation();
  // Start hidden; reveal after mount only if not yet acknowledged. Avoids any
  // SSR/hydration flash and never blocks first paint.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage blocked (private mode) — show it; dismissal just won't persist.
      setVisible(true);
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookies"
      className="fixed inset-x-0 bottom-0 z-[100] cookie-consent-enter px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-surface-700 bg-surface-900/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:gap-4 sm:p-5">
        <div className="flex items-start gap-3 sm:items-center">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-primary-400">
            <Cookie className="h-5 w-5" />
          </div>
          <p className="text-sm leading-relaxed text-surface-300">
            {t("cookie.message")}{" "}
            <Link
              href="/privacy"
              className="font-medium text-primary-400 underline-offset-2 hover:underline"
            >
              {t("cookie.privacyLink")}
            </Link>
            .
          </p>
        </div>
        <button
          onClick={accept}
          className="flex-shrink-0 self-stretch rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 sm:self-auto"
        >
          {t("cookie.accept")}
        </button>
      </div>
    </div>
  );
}
