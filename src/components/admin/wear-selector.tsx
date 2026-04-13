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
  const [floatText, setFloatText] = useState(float != null ? float.toString() : "");
  const [floatError, setFloatError] = useState<string | null>(null);

  function isWearAvailable(wear: (typeof CS2_WEAR_CONDITIONS)[number]) {
    return wear.floatMin < maxFloat && wear.floatMax > minFloat;
  }

  function handleWearClick(wear: (typeof CS2_WEAR_CONDITIONS)[number]) {
    if (!isWearAvailable(wear)) return;
    onWearChange(wear.value);
    setFloatError(null);
  }

  function handleFloatInput(value: string) {
    // Allow typing freely
    setFloatText(value);

    if (value === "" || value === "0." || value === "0.0") {
      onFloatChange(null);
      setFloatError(null);
      return;
    }

    const num = parseFloat(value);
    if (isNaN(num)) return;

    if (num < minFloat || num > maxFloat) {
      setFloatError(`Float deve estar entre ${minFloat} e ${maxFloat}`);
      onFloatChange(num);
      return;
    }

    setFloatError(null);
    onFloatChange(num);
    onWearChange(getWearFromFloat(num));
  }

  return (
    <div className="space-y-4">
      {/* Wear buttons */}
      <div className="grid grid-cols-5 gap-2">
        {CS2_WEAR_CONDITIONS.map((wear) => {
          const available = isWearAvailable(wear);
          const selected = wear.value === selectedWear;

          return (
            <button
              key={wear.value}
              type="button"
              disabled={!available}
              onClick={() => handleWearClick(wear)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border-2 px-2 py-3 text-center transition-all",
                selected
                  ? "border-primary-500 bg-primary-500/10"
                  : available
                  ? "border-surface-700 hover:border-surface-500 bg-transparent"
                  : "border-surface-800 bg-surface-800/30 opacity-40 cursor-not-allowed"
              )}
            >
              <span
                className="text-lg font-bold"
                style={{ color: available ? wear.color : undefined }}
              >
                {wear.shortName}
              </span>
              <span className="text-[10px] text-surface-400 leading-tight">
                {wear.value.split(" ").map((w, i) => (
                  <span key={i} className="block">{w}</span>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {/* Float input */}
      <div className="space-y-1">
        <label className="text-sm text-surface-400">
          Float exato <span className="text-surface-600">(opcional)</span>
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={floatText}
          onChange={(e) => handleFloatInput(e.target.value)}
          placeholder={`${minFloat} - ${maxFloat}`}
          className={cn(
            "w-full rounded-lg border bg-transparent px-3 py-2 text-sm font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20",
            floatError
              ? "border-red-500/50 text-red-400"
              : "border-surface-700 text-[var(--foreground)]"
          )}
        />
        {floatError && (
          <p className="text-xs text-red-400">{floatError}</p>
        )}
      </div>

      {/* StatTrak / Souvenir */}
      {(hasStattrak || hasSouvenir) && (
        <div className="flex gap-4">
          {hasStattrak && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={stattrak}
                onChange={(e) => onStatTrakChange(e.target.checked)}
                className="rounded border-surface-600"
              />
              <span className="text-sm font-medium" style={{ color: "#cf6a32" }}>
                StatTrak™
              </span>
            </label>
          )}
          {hasSouvenir && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={souvenir}
                onChange={(e) => onSouvenirChange(e.target.checked)}
                className="rounded border-surface-600"
              />
              <span className="text-sm font-medium" style={{ color: "#ffd700" }}>
                Souvenir
              </span>
            </label>
          )}
        </div>
      )}
    </div>
  );
}
