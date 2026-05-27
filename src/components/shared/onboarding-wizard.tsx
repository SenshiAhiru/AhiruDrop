"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X, ChevronRight, ChevronLeft, Sparkles, Coins, ShoppingCart,
  Shield, Trophy, Check, Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/provider";

interface Props {
  userName: string;
  onDismiss: () => void;
}

type Step = {
  icon: typeof Sparkles;
  iconColor: string;
  title: string;
  description: React.ReactNode;
  accent?: string;
};

export function OnboardingWizard({ userName, onDismiss }: Props) {
  const { t } = useTranslation();
  const firstName = userName?.split(" ")[0] ?? "você";
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [dismissing, setDismissing] = useState(false);

  const STEPS: Step[] = [
    {
      icon: Sparkles,
      iconColor: "text-primary-400",
      title: t("onboarding.welcome", { firstName }),
      description: <>{t("onboarding.welcomeDesc")}</>,
      accent: "from-primary-500/20 via-primary-500/10 to-transparent",
    },
    {
      icon: Coins,
      iconColor: "text-accent-400",
      title: t("onboarding.ahcTitle"),
      description: <>{t("onboarding.ahcDesc")}</>,
      accent: "from-accent-500/20 via-accent-500/10 to-transparent",
    },
    {
      icon: Ticket,
      iconColor: "text-emerald-400",
      title: t("onboarding.pickTitle"),
      description: <>{t("onboarding.pickDesc")}</>,
      accent: "from-emerald-500/20 via-emerald-500/10 to-transparent",
    },
    {
      icon: Shield,
      iconColor: "text-blue-400",
      title: t("onboarding.fairTitle"),
      description: <>{t("onboarding.fairDesc")}</>,
      accent: "from-blue-500/20 via-blue-500/10 to-transparent",
    },
    {
      icon: Trophy,
      iconColor: "text-amber-400",
      title: t("onboarding.winTitle"),
      description: <>{t("onboarding.winDesc")}</>,
      accent: "from-amber-500/20 via-amber-500/10 to-transparent",
    },
  ];

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;
  const isFirst = index === 0;
  const Icon = step.icon;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function handleClose() {
    if (dismissing) return;
    setDismissing(true);
    setVisible(false);
    setTimeout(onDismiss, 300);
  }

  function next() {
    if (isLast) {
      handleClose();
    } else {
      setIndex((i) => i + 1);
    }
  }

  function prev() {
    if (!isFirst) setIndex((i) => i - 1);
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />

      {/* Card */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-2xl border border-surface-700 bg-surface-950 shadow-2xl overflow-hidden",
          "transition-all duration-300",
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        {/* Top accent */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-32 bg-gradient-to-br transition-colors duration-500",
            step.accent
          )}
        />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/50 transition-colors"
          aria-label={t("onboarding.skip")}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative z-10 p-6 sm:p-8">
          {/* Icon */}
          <div
            className={cn(
              "mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-900/80 border border-surface-700 backdrop-blur-sm",
              step.iconColor
            )}
          >
            <Icon className="h-8 w-8" />
          </div>

          {/* Title + description */}
          <h2 className="text-center text-xl sm:text-2xl font-bold text-white mb-3">
            {step.title}
          </h2>
          <p className="text-center text-sm text-surface-300 leading-relaxed mb-6 min-h-[4.5rem]">
            {step.description}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index
                    ? "w-8 bg-primary-500"
                    : i < index
                    ? "w-1.5 bg-primary-500/50"
                    : "w-1.5 bg-surface-700"
                )}
                aria-label={t("onboarding.goToStep", { n: i + 1 })}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isFirst ? (
              <button
                onClick={prev}
                className="flex items-center gap-1 rounded-lg border border-surface-700 px-3 py-2 text-sm text-surface-300 hover:bg-surface-800 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("onboarding.back")}
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="rounded-lg border border-surface-700 px-3 py-2 text-sm text-surface-400 hover:text-white transition-colors"
              >
                {t("onboarding.skipShort")}
              </button>
            )}

            {isLast ? (
              <Link
                href="/raffles"
                onClick={handleClose}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 transition-shadow"
              >
                <ShoppingCart className="h-4 w-4" />
                {t("onboarding.exploreRaffles")}
              </Link>
            ) : (
              <button
                onClick={next}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
              >
                {t("onboarding.next")}
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Step counter */}
          <p className="mt-4 text-center text-[10px] uppercase tracking-wider text-surface-500">
            {t("onboarding.stepCounter", { current: index + 1, total: STEPS.length })}
          </p>
        </div>
      </div>
    </div>
  );
}
