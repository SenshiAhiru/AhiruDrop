"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

// Conversion rate: 1 AHC = R$ 1.00
const BRL_RATE = 1;

export default function DepositPage() {
  const { data: session } = useSession();
  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/balance")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setBalance(Number(json.data.balance));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const numAmount = parseFloat(amount) || 0;
  const brlPrice = numAmount * BRL_RATE;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Adicionar AhiruCoins</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Compre AhiruCoins (AHC) para participar das rifas de skins CS2
        </p>
      </div>

      {/* Current balance */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/10">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-500 text-surface-950 text-sm font-black">
                  A
                </div>
              </div>
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
            <div className="text-right text-xs text-[var(--muted-foreground)]">
              <p>1 AHC = R$ 1,00</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amount selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Escolha o valor</CardTitle>
          <CardDescription>Selecione um valor ou digite um personalizado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preset buttons */}
          <div className="grid grid-cols-3 gap-3">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(String(preset))}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 p-4 transition-all ${
                  amount === String(preset)
                    ? "border-accent-500 bg-accent-500/10"
                    : "border-surface-700 hover:border-surface-500"
                }`}
              >
                <span className="text-lg font-bold text-accent-400">{preset}</span>
                <span className="text-[10px] text-[var(--muted-foreground)]">AHC</span>
                <span className="text-xs text-surface-500">{formatCurrency(preset * BRL_RATE)}</span>
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="space-y-2">
            <label className="text-sm text-[var(--muted-foreground)]">Valor personalizado</label>
            <div className="relative">
              <Input
                type="number"
                min={1}
                step={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Digite a quantidade de AHC"
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-accent-500">AHC</span>
            </div>
          </div>

          {/* Summary */}
          {numAmount > 0 && (
            <div className="rounded-xl border border-surface-700 bg-surface-800/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Quantidade</span>
                <span className="font-semibold text-accent-400">{numAmount} AHC</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Valor em BRL</span>
                <span className="font-semibold">{formatCurrency(brlPrice)}</span>
              </div>
              <hr className="border-surface-700" />
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Saldo após depósito</span>
                <span className="font-bold text-accent-400">
                  {((balance || 0) + numAmount).toFixed(2)} AHC
                </span>
              </div>
            </div>
          )}

          {/* Pay button */}
          <Button
            className="w-full"
            size="lg"
            disabled={numAmount <= 0}
            onClick={() => alert("Sistema de pagamento em implementação. Em breve você poderá depositar via PIX!")}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
            Pagar {numAmount > 0 ? formatCurrency(brlPrice) : ""} via PIX
          </Button>

          <p className="text-center text-xs text-[var(--muted-foreground)]">
            Pagamento processado instantaneamente via PIX
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
