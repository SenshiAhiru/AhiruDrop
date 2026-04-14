"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

const CURRENCIES = [
  { code: "BRL", symbol: "R$", flag: "🇧🇷", name: "Real" },
  { code: "USD", symbol: "$", flag: "🇺🇸", name: "Dólar" },
  { code: "EUR", symbol: "€", flag: "🇪🇺", name: "Euro" },
  { code: "GBP", symbol: "£", flag: "🇬🇧", name: "Libra" },
  { code: "RUB", symbol: "₽", flag: "🇷🇺", name: "Rublo" },
];

const PRESETS_AHC = [10, 25, 50, 100, 250, 500];

export default function DepositPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [currency, setCurrency] = useState("BRL");
  const [ahcAmount, setAhcAmount] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/balance").then((r) => r.json()),
      fetch("/api/exchange").then((r) => r.json()),
    ])
      .then(([balJson, ratesJson]) => {
        if (balJson.success) setBalance(Number(balJson.data.balance));
        if (ratesJson.success) setRates(ratesJson.data.rates);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const numAhc = parseFloat(ahcAmount) || 0;
  const rate = rates?.[currency] || 1;
  const fiatPrice = rate > 0 ? numAhc / rate : 0;
  const currencyInfo = CURRENCIES.find((c) => c.code === currency)!;

  function formatFiat(value: number): string {
    return `${currencyInfo.symbol} ${value.toFixed(2)}`;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Adicionar AhiruCoins</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Compre AHC para participar das rifas de skins CS2
        </p>
      </div>

      {/* Balance */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ahc-coin.png" alt="AHC" className="h-12 w-12 rounded-full" />
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Seu saldo</p>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-2xl font-bold text-accent-400">
                    {balance?.toFixed(2) ?? "0.00"} <span className="text-sm text-accent-500/70">AHC</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Moeda de pagamento</CardTitle>
          <CardDescription>Selecione como deseja pagar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => setCurrency(c.code)}
                className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                  currency === c.code
                    ? "border-primary-500 bg-primary-500/10 text-white"
                    : "border-surface-700 text-surface-400 hover:border-surface-500"
                }`}
              >
                <span className="text-lg">{c.flag}</span>
                <span>{c.code}</span>
              </button>
            ))}
          </div>

          {/* Exchange rate info */}
          {rates && (
            <div className="mt-3 flex items-center gap-2 text-xs text-surface-500">
              <RefreshCw className="h-3 w-3" />
              <span>
                1 {currencyInfo.code} = {rate.toFixed(2)} AHC
                {currency !== "BRL" && ` (cotação atualizada)`}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Amount */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quantidade de AHC</CardTitle>
          <CardDescription>Selecione ou digite a quantidade desejada</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Presets */}
          <div className="grid grid-cols-3 gap-3">
            {PRESETS_AHC.map((preset) => (
              <button
                key={preset}
                onClick={() => setAhcAmount(String(preset))}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all ${
                  ahcAmount === String(preset)
                    ? "border-accent-500 bg-accent-500/10"
                    : "border-surface-700 hover:border-surface-500"
                }`}
              >
                <div className="flex items-center gap-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/ahc-coin.png" alt="" className="h-4 w-4 rounded-full" />
                  <span className="text-lg font-bold text-accent-400">{preset}</span>
                </div>
                <span className="text-[10px] text-surface-500">
                  {formatFiat(rate > 0 ? preset / rate : preset)}
                </span>
              </button>
            ))}
          </div>

          {/* Custom */}
          <div className="space-y-2">
            <label className="text-sm text-[var(--muted-foreground)]">Valor personalizado</label>
            <div className="relative">
              <Input
                type="number"
                min={1}
                step={1}
                value={ahcAmount}
                onChange={(e) => setAhcAmount(e.target.value)}
                placeholder="Quantidade de AHC"
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-accent-500">AHC</span>
            </div>
          </div>

          {/* Summary */}
          {numAhc > 0 && (
            <div className="rounded-xl border border-surface-700 bg-surface-800/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Você recebe</span>
                <div className="flex items-center gap-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/ahc-coin.png" alt="" className="h-4 w-4 rounded-full" />
                  <span className="font-bold text-accent-400">{numAhc} AHC</span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Você paga</span>
                <span className="font-semibold text-white">
                  {currencyInfo.flag} {formatFiat(fiatPrice)}
                </span>
              </div>
              {currency !== "BRL" && (
                <div className="flex justify-between text-xs">
                  <span className="text-surface-500">Cotação</span>
                  <span className="text-surface-400">1 {currency} = {rate.toFixed(2)} AHC</span>
                </div>
              )}
              <hr className="border-surface-700" />
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Saldo após depósito</span>
                <span className="font-bold text-accent-400">
                  {((balance || 0) + numAhc).toFixed(2)} AHC
                </span>
              </div>
            </div>
          )}

          {/* Pay button */}
          <Button
            className="w-full"
            size="lg"
            disabled={numAhc <= 0}
            onClick={() => alert("Sistema de pagamento em implementação. Em breve!")}
          >
            {currency === "BRL" ? (
              <>
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5Z" />
                </svg>
                Pagar {numAhc > 0 ? formatFiat(fiatPrice) : ""} via PIX
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
                Pagar {numAhc > 0 ? formatFiat(fiatPrice) : ""} via Stripe
              </>
            )}
          </Button>

          <p className="text-center text-xs text-[var(--muted-foreground)]">
            {currency === "BRL"
              ? "Pagamento instantâneo via PIX"
              : `Pagamento internacional via cartão de crédito (${currency})`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
