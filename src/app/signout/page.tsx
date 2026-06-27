"use client";

import { signOut } from "next-auth/react";
import { LogOut, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { useTranslation } from "@/i18n/provider";

export default function SignOutPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-950 px-4">
      <div className="mb-8">
        <Logo size="lg" />
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-surface-800 bg-surface-900 p-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
          <LogOut className="h-7 w-7 text-red-400" />
        </div>

        <h1 className="text-xl font-bold text-white mb-2">{t("signout.title")}</h1>
        <p className="text-sm text-surface-400 mb-6">
          {t("signout.confirm")}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {t("signout.yes")}
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-lg border border-surface-700 text-surface-400 font-medium hover:text-white hover:bg-surface-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </button>
        </div>
      </div>
    </div>
  );
}
