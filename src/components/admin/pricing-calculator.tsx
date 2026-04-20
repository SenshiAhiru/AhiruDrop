"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, ChevronDown, Sparkles, Wand2 } from "lucide-react";

interface PricingCalculatorProps {
  /** Called when admin clicks "Aplicar" with the computed values */
  onApply: (values: { pricePerNumber: number; totalNumbers: number }) => void;
  /** Optional initial values to hydrate the form */
  initial?: { skinUsd?: number; margin?: number; totalNumbers?: number };
}

const MARGIN_PRESETS = [
  { label: "Flash 10%", value: 10 },
  { label: "Padrão 20%", value: 20 },
  { label: "Premium 25%", value: 25 },
  { label: "Raro 30%", value: 30 },
];

const COTAS_PRESETS = [20, 50, 100, 200, 500, 1000, 2000, 5000];

export function PricingCalculator({ onApply, initial }: PricingCalculatorProps) {
  const [open, setOpen] = useState(false);
  const [skinUsd, setSkinUsd] = useState(initial?.skinUsd?.toString() ?? "");
  const [margin, setMargin] = useState(initial?.margin?.toString() ?? "20");
  const [totalCotas, setTotalCotas] = useState(initial?.totalNumbers?.toString() ?? "100");
  const [usdToBrl, setUsdToBrl] = useState<number | null>(null);

  // Fetch FX rate for preview
  useEffect(() => {
    let cancelled = false;
    fetch("/api/fx/rates", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled && json.success) setUsdToBrl(Number(json.data.usdToBrl));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const result = useMemo(() => {
    const usd = parseFloat(skinUsd);
    const marginPct = parseFloat(margin);
    const cotas = parseInt(totalCotas, 10);

    if (
      !isFinite(usd) || usd <= 0 ||
      !isFinite(marginPct) || marginPct < 0 ||
      !Number.isInteger(cotas) || cotas <= 0
    ) {
      return null;
    }

    const potAhc = usd * (1 + marginPct / 100); // 1 AHC = $1 USD
    const rawPerCota = potAhc / cotas;
    // Round to 2 decimals (cents)
    const pricePerCota = Math.ceil(rawPerCota * 100) / 100;
    const realPotAhc = pricePerCota * cotas;
    const realMargin = (realPotAhc - usd) / usd * 100;
    const oddsPct = (1 / cotas) * 100;

    return {
      usd,
      marginPct,
      cotas,
      pricePerCota,
      rawPerCota,
      potAhc: realPotAhc,
      realMargin,
      oddsPct,
    };
  }, [skinUsd, margin, totalCotas]);

  const tooLow = result && result.pricePerCota < 0.3;
  const tooHigh = result && result.pricePerCota > 50;

  function handleApply() {
    if (!result) return;
    onApply({
      pricePerNumber: result.pricePerCota,
      totalNumbers: result.cotas,
    });
  }

  return (
    <div className="rounded-xl border border-primary-500/20 bg-gradient-to-br from-primary-950/30 to-surface-900/40 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-primary-500/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/20 text-primary-400">
            <Calculator className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Calculadora de preço</div>
            <div className="text-[11px] text-surface-400">
              Calcule o preço por cota a partir do valor da skin e margem desejada
            </div>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-surface-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Body */}
      {open && (
        <div className="p-4 pt-3 border-t border-primary-500/20 space-y-4">
          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Skin price */}
            <div>
              <label className="block text-[11px] font-semibold text-surface-300 mb-1 uppercase tracking-wider">
                Preço da skin (Steam Market)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-accent-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={skinUsd}
                  onChange={(e) => setSkinUsd(e.target.value)}
                  placeholder="40.00"
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-surface-700 bg-surface-900/60 text-sm text-white placeholder:text-surface-600 focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>
              {usdToBrl !== null && parseFloat(skinUsd) > 0 && (
                <p className="mt-1 text-[10px] text-surface-500">
                  ≈ R$ {(parseFloat(skinUsd) * usdToBrl).toFixed(2)}
                </p>
              )}
            </div>

            {/* Margin */}
            <div>
              <label className="block text-[11px] font-semibold text-surface-300 mb-1 uppercase tracking-wider">
                Margem desejada
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 rounded-lg border border-surface-700 bg-surface-900/60 text-sm text-white focus:border-primary-500 focus:outline-none transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-surface-500">%</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {MARGIN_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setMargin(p.value.toString())}
                    className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                      parseFloat(margin) === p.value
                        ? "border-primary-500/60 bg-primary-500/20 text-primary-300"
                        : "border-surface-700 text-surface-400 hover:border-surface-500 hover:text-surface-300"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Total cotas */}
            <div>
              <label className="block text-[11px] font-semibold text-surface-300 mb-1 uppercase tracking-wider">
                Total de cotas
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={totalCotas}
                onChange={(e) => setTotalCotas(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-700 bg-surface-900/60 text-sm text-white focus:border-primary-500 focus:outline-none transition-colors"
              />
              <div className="mt-1 flex flex-wrap gap-1">
                {COTAS_PRESETS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setTotalCotas(n.toString())}
                    className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                      parseInt(totalCotas, 10) === n
                        ? "border-accent-500/60 bg-accent-500/20 text-accent-300"
                        : "border-surface-700 text-surface-400 hover:border-surface-500 hover:text-surface-300"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result */}
          {result ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <ResultCard
                  label="Preço por cota"
                  value={`${result.pricePerCota.toFixed(2)} AHC`}
                  sublabel={
                    usdToBrl !== null
                      ? `≈ R$ ${(result.pricePerCota * usdToBrl).toFixed(2)}`
                      : `$${result.pricePerCota.toFixed(2)}`
                  }
                  highlight
                />
                <ResultCard
                  label="Pot arrecadado"
                  value={`${result.potAhc.toFixed(0)} AHC`}
                  sublabel={
                    usdToBrl !== null
                      ? `≈ R$ ${(result.potAhc * usdToBrl).toFixed(2)}`
                      : `$${result.potAhc.toFixed(2)}`
                  }
                />
                <ResultCard
                  label="Margem real"
                  value={`${result.realMargin.toFixed(1)}%`}
                  sublabel={`+$${(result.potAhc - result.usd).toFixed(2)} de lucro`}
                  tone={result.realMargin < 10 ? "warn" : "ok"}
                />
                <ResultCard
                  label="Chance por cota"
                  value={`${result.oddsPct.toFixed(result.oddsPct < 0.1 ? 3 : 2)}%`}
                  sublabel={`1 em ${result.cotas}`}
                />
              </div>

              {/* Warnings */}
              {(tooLow || tooHigh) && (
                <div
                  className={`rounded-lg border p-3 text-xs ${
                    tooLow
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                  }`}
                >
                  {tooLow && (
                    <>
                      ⚠️ Preço por cota abaixo de <strong>0,30 AHC</strong> — usuário teria
                      que comprar várias cotas pra bater o mínimo da Stripe. Considere
                      reduzir o nº de cotas ou aumentar a margem.
                    </>
                  )}
                  {tooHigh && (
                    <>
                      ⚠️ Preço por cota acima de <strong>50 AHC</strong> — pode afastar
                      usuários casuais. Considere aumentar o nº de cotas.
                    </>
                  )}
                </div>
              )}

              {/* Apply button */}
              <button
                type="button"
                onClick={handleApply}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-shadow"
              >
                <Wand2 className="h-4 w-4" />
                Aplicar aos campos da rifa
              </button>
            </>
          ) : (
            <div className="rounded-lg border border-surface-700 bg-surface-900/40 p-4 text-center text-xs text-surface-500">
              <Sparkles className="h-4 w-4 mx-auto mb-1 text-surface-600" />
              Preencha preço da skin, margem e cotas pra ver o cálculo
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultCard({
  label,
  value,
  sublabel,
  highlight,
  tone,
}: {
  label: string;
  value: string;
  sublabel?: string;
  highlight?: boolean;
  tone?: "ok" | "warn";
}) {
  const valueClass = highlight
    ? "text-accent-400"
    : tone === "warn"
    ? "text-amber-400"
    : tone === "ok"
    ? "text-emerald-400"
    : "text-white";

  return (
    <div
      className={`rounded-lg border p-2.5 ${
        highlight
          ? "border-accent-500/40 bg-accent-500/10"
          : "border-surface-700 bg-surface-900/40"
      }`}
    >
      <div className="text-[9px] font-semibold uppercase tracking-wider text-surface-500 mb-0.5">
        {label}
      </div>
      <div className={`text-base font-bold ${valueClass}`}>{value}</div>
      {sublabel && <div className="text-[10px] text-surface-500 mt-0.5">{sublabel}</div>}
    </div>
  );
}
