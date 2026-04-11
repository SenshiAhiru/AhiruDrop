"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CS2_WEAR_CONDITIONS, getWearFromFloat } from "@/constants/cs2";

interface WearSelectorProps {
  selectedWear: string;
  onWearChange: (wear: string) => void;
  float: number | null;
  onFloatChange: (float: number | null) => void;
  stattrak: boolean;
  onStatTrakChange: (stattrak: boolean) => void;
  souvenir: boolean;
  onSouvenirChange: (souvenir: boolean) => void;
  minFloat: number;
  maxFloat: number;
  hasStattrak: boolean;
  hasSouvenir: boolean;
}

export function WearSelector({
  selectedWear,
  onWearChange,
  float,
  onFloatChange,
  stattrak,
  onStatTrakChange,
  souvenir,
  onSouvenirChange,
  minFloat,
  maxFloat,
  hasStattrak,
  hasSouvenir,
}: WearSelectorProps) {
  const [floatError, setFloatError] = useState<string | null>(null);

  function isWearAvailable(wear: (typeof CS2_WEAR_CONDITIONS)[number]) {
    return wear.floatMin < maxFloat && wear.floatMax > minFloat;
  }

  function handleWearClick(wear: (typeof CS2_WEAR_CONDITIONS)[number]) {
    if (!isWearAvailable(wear)) return;
    onWearChange(wear.value);
    setFloatError(null);
  }

  function handleFloatChange(value: string) {
    if (value === "") {
      onFloatChange(null);
      setFloatError(null);
      return;
    }

    const num = parseFloat(value);
    if (isNaN(num)) return;

    if (num < minFloat || num > maxFloat) {
      setFloatError(`Float deve estar entre ${minFloat.toFixed(3)} e ${maxFloat.toFixed(3)}`);
      onFloatChange(num);
      return;
    }

    setFloatError(null);
    onFloatChange(num);
    onWearChange(getWearFromFloat(num));
  }

  const selectedIndex = CS2_WEAR_CONDITIONS.findIndex((w) => w.value === selectedWear);

  return (
    <div className="space-y-5">
      {/* ── Visual Wear Bar ── */}
      <div className="space-y-2">
        {/* Indicator dots */}
        <div className="relative flex h-4">
          {CS2_WEAR_CONDITIONS.map((wear, i) => {
            const isAvailable = isWearAvailable(wear);
            const isSelected = wear.value === selectedWear;
            const segmentWidth = 100 / CS2_WEAR_CONDITIONS.length;
            const leftPercent = segmentWidth * i + segmentWidth / 2;

            return (
              <div
                key={wear.value}
                className="absolute -translate-x-1/2"
                style={{ left: `${leftPercent}%` }}
              >
                {isSelected && (
                  <div
                    className={cn(
                      "h-3 w-3 rounded-full border-2 border-white shadow-md",
                      !isAvailable && "opacity-30"
                    )}
                    style={{ backgroundColor: wear.color }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Gradient bar */}
        <div className="relative flex h-3 overflow-hidden rounded-full">
          {CS2_WEAR_CONDITIONS.map((wear, i) => {
            const isAvailable = isWearAvailable(wear);
            const isSelected = wear.value === selectedWear;

            return (
              <button
                key={wear.value}
                type="button"
                disabled={!isAvailable}
                onClick={() => handleWearClick(wear)}
                className={cn(
                  "flex-1 transition-opacity",
                  !isAvailable && "opacity-20 cursor-not-allowed",
                  isAvailable && "cursor-pointer hover:opacity-80",
                  isSelected && "ring-2 ring-white/60 ring-offset-1 ring-offset-[var(--background)]",
                  i === 0 && "rounded-l-full",
                  i === CS2_WEAR_CONDITIONS.length - 1 && "rounded-r-full"
                )}
                style={{ backgroundColor: wear.color }}
              />
            );
          })}
        </div>

        {/* Short labels below the bar */}
        <div className="flex">
          {CS2_WEAR_CONDITIONS.map((wear) => {
            const isAvailable = isWearAvailable(wear);
            return (
              <span
                key={wear.value}
                className={cn(
                  "flex-1 text-center text-[10px] font-bold uppercase tracking-wider",
                  isAvailable ? "text-[var(--muted-foreground)]" : "text-[var(--muted-foreground)]/30"
                )}
              >
                {wear.shortName}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Wear Condition Buttons ── */}
      <div className="grid grid-cols-5 gap-2">
        {CS2_WEAR_CONDITIONS.map((wear) => {
          const isAvailable = isWearAvailable(wear);
          const isSelected = wear.value === selectedWear;

          return (
            <button
              key={wear.value}
              type="button"
              disabled={!isAvailable}
              onClick={() => handleWearClick(wear)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg p-2.5 text-center transition-all",
                isSelected
                  ? "border-2 border-primary-500 bg-primary-500/10"
                  : "border border-[var(--border)] hover:border-primary-300",
                !isAvailable && "cursor-not-allowed opacity-30"
              )}
            >
              <span
                className="text-sm font-bold"
                style={{ color: isAvailable ? wear.color : undefined }}
              >
                {wear.shortName}
              </span>
              <span className="text-[10px] leading-tight text-[var(--muted-foreground)]">
                {wear.value}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Float Input ── */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--muted-foreground)]">
          Float exato (opcional)
        </label>
        <input
          type="number"
          step={0.001}
          min={minFloat}
          max={maxFloat}
          value={float ?? ""}
          onChange={(e) => handleFloatChange(e.target.value)}
          placeholder="0.000"
          className={cn(
            "w-full rounded-lg border bg-[var(--card)] px-3 py-2 text-sm font-mono transition-colors placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-primary-500/20",
            floatError
              ? "border-danger focus:border-danger"
              : "border-[var(--border)] focus:border-primary-500"
          )}
        />
        {floatError && (
          <p className="text-xs text-danger">{floatError}</p>
        )}
      </div>

      {/* ── Checkboxes ── */}
      {(hasStattrak || hasSouvenir) && (
        <div className="flex items-start gap-6">
          {hasStattrak && (
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={stattrak}
                onChange={(e) => onStatTrakChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[var(--border)] bg-[var(--card)] text-primary-600 accent-primary-600 focus:ring-primary-500/30"
              />
              <div>
                <span className="text-sm font-semibold" style={{ color: "#cf6a32" }}>
                  StatTrak&trade;
                </span>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Conta eliminacoes
                </p>
              </div>
            </label>
          )}

          {hasSouvenir && (
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={souvenir}
                onChange={(e) => onSouvenirChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[var(--border)] bg-[var(--card)] text-primary-600 accent-primary-600 focus:ring-primary-500/30"
              />
              <div>
                <span className="text-sm font-semibold" style={{ color: "#ffd700" }}>
                  Souvenir
                </span>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Edicao de torneio
                </p>
              </div>
            </label>
          )}
        </div>
      )}
    </div>
  );
}
