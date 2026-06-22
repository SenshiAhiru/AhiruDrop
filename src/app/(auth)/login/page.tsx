"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "@/i18n/provider";

/**
 * Steam-only login.
 *
 * There is no email/password path anymore — every account is a Steam
 * account (Steam is required to receive skin prizes anyway). Clicking
 * the button hits /api/auth/steam, which redirects to Steam OpenID and
 * comes back through /api/auth/steam/callback → /auth/steam-complete.
 */
export default function LoginPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const [isLoading, setIsLoading] = useState(false);

  function handleSteamLogin() {
    setIsLoading(true);
    // Steam OpenID round-trip; callback lands the user on /dashboard.
    window.location.href = "/api/auth/steam";
  }

  return (
    <Card className="border-surface-800/50 bg-surface-900/80 backdrop-blur-sm">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold text-[var(--foreground)]">
          {t("auth.login.title")}
        </CardTitle>
        <CardDescription>{t("auth.login.steamSubtitle")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorParam && (
          <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {t("auth.login.steamError")}
          </div>
        )}

        <button
          onClick={handleSteamLogin}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#171a21] px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-[#2a3f5a] disabled:opacity-60"
        >
          {/* Steam logo */}
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z" />
          </svg>
          {isLoading ? t("auth.login.steamRedirecting") : t("auth.login.steamButton")}
        </button>

        <div className="flex items-start gap-2 rounded-lg border border-surface-800 bg-surface-800/30 px-3 py-2.5 text-xs text-surface-400">
          <ShieldCheck className="h-4 w-4 flex-shrink-0 text-emerald-400 mt-0.5" />
          <span>{t("auth.login.steamWhy")}</span>
        </div>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-center text-xs text-surface-500">
          {t("auth.login.steamTerms")}
        </p>
      </CardFooter>
    </Card>
  );
}
