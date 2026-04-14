"use client";

import { useState, useEffect } from "react";
import { loadStripe, type Stripe as StripeType } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Loader2 } from "lucide-react";

const CURRENCIES = [
  { code: "BRL", symbol: "R$", flag: "🇧🇷", name: "Real" },
  { code: "USD", symbol: "$", flag: "🇺🇸", name: "Dólar" },
  { code: "EUR", symbol: "€", flag: "🇪🇺", name: "Euro" },
  { code: "GBP", symbol: "£", flag: "🇬🇧", name: "Libra" },
];

const PRESETS_AHC = [10, 25, 50, 100, 250, 500];

// ─── Payment Form (inside Elements) ───
function PaymentForm({ amount, onSuccess }: { amount: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPaying(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message || "Erro no pagamento");
      setPaying(false);
    } else if (result.paymentIntent?.status === "succeeded") {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={!stripe || paying}>
        {paying ? (
          <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Processando...</>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ahc-coin.png" alt="" className="h-5 w-5 rounded-full mr-2" />
            Pagar e receber {amount} AHC
          </>
        )}
      </Button>
    </form>
  );
}

// ─── Main Page ───
export default function DepositPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState("BRL");
  const [ahcAmount, setAhcAmount] = useState("");
  const [loading, setLoading] = useState(true);

  // Payment state
  const [stripePromise, setStripePromise] = useState<Promise<StripeType | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/user/balance")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setBalance(Number(json.data.balance));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const numAhc = parseFloat(ahcAmount) || 0;
  const currencyInfo = CURRENCIES.find((c) => c.code === currency)!;

  const handleStartPayment = async () => {
    if (numAhc < 1) return;
    setCreating(true);

    try {
      const res = await fetch("/api/deposit/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numAhc, currency }),
      });
      const json = await res.json();

      if (json.success && json.data?.clientSecret && json.data?.publishableKey) {
        setStripePromise(loadStripe(json.data.publishableKey));
        setClientSecret(json.data.clientSecret);
        setShowPayment(true);
      } else {
        alert(json.error || "Erro ao iniciar pagamento");
      }
    } catch {
      alert("Erro ao conectar com gateway");
    } finally {
      setCreating(false);
    }
  };

  const handleSuccess = () => {
    setSuccess(true);
    setShowPayment(false);
    setBalance((prev) => (prev || 0) + numAhc);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle className="h-10 w-10 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Depósito realizado!</h1>
        <p className="text-surface-400 mb-4">Seu saldo foi creditado com sucesso.</p>
        <div className="flex items-center gap-2 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ahc-coin.png" alt="AHC" className="h-8 w-8 rounded-full" />
          <span className="text-3xl font-bold text-accent-400">+{numAhc} AHC</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setSuccess(false); setAhcAmount(""); setClientSecret(null); }}
            className="rounded-lg border border-surface-700 px-6 py-2.5 text-sm font-medium text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            Depositar mais
          </button>
          <a href="/raffles" className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors">
            Ver rifas
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Adicionar AhiruCoins</h1>
        <p className="text-[var(--muted-foreground)] mt-1">Compre AHC para participar das rifas de skins CS2</p>
      </div>

      {/* Balance */}
      <Card>
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>

      {!showPayment ? (
        <>
          {/* Currency */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Moeda de pagamento</CardTitle>
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
              <p className="mt-2 text-xs text-surface-500">1 {currencyInfo.code} = 1 AHC (taxa fixa)</p>
            </CardContent>
          </Card>

          {/* Amount */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quantidade de AHC</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <span className="text-[10px] text-surface-500">{currencyInfo.symbol} {preset.toFixed(2)}</span>
                  </button>
                ))}
              </div>

              <div className="relative">
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={ahcAmount}
                  onChange={(e) => setAhcAmount(e.target.value)}
                  placeholder="Quantidade personalizada"
                  className="pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-accent-500">AHC</span>
              </div>

              {numAhc > 0 && (
                <div className="rounded-xl border border-surface-700 bg-surface-800/50 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-400">Você recebe</span>
                    <span className="font-bold text-accent-400">{numAhc} AHC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-400">Você paga</span>
                    <span className="font-semibold text-white">{currencyInfo.flag} {currencyInfo.symbol} {numAhc.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                disabled={numAhc < 1 || creating}
                onClick={handleStartPayment}
              >
                {creating ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Preparando...</>
                ) : (
                  `Continuar para pagamento`
                )}
              </Button>

              <p className="text-center text-xs text-surface-500">Pagamento seguro via Stripe</p>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Payment form */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Pagamento</CardTitle>
                <CardDescription>
                  {numAhc} AHC • {currencyInfo.flag} {currencyInfo.symbol} {numAhc.toFixed(2)}
                </CardDescription>
              </div>
              <button
                onClick={() => { setShowPayment(false); setClientSecret(null); }}
                className="text-sm text-surface-400 hover:text-white transition-colors"
              >
                ← Voltar
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {stripePromise && clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "night",
                    variables: {
                      colorPrimary: "#7c3aed",
                      colorBackground: "#18181b",
                      colorText: "#fafafa",
                      colorTextSecondary: "#a1a1aa",
                      colorDanger: "#ef4444",
                      borderRadius: "8px",
                      fontFamily: "system-ui, sans-serif",
                    },
                    rules: {
                      ".Input": {
                        border: "1px solid #3f3f46",
                        backgroundColor: "#09090b",
                      },
                      ".Input:focus": {
                        border: "1px solid #7c3aed",
                        boxShadow: "0 0 0 1px #7c3aed33",
                      },
                      ".Tab": {
                        border: "1px solid #3f3f46",
                        backgroundColor: "#18181b",
                      },
                      ".Tab--selected": {
                        border: "1px solid #7c3aed",
                        backgroundColor: "#7c3aed1a",
                      },
                    },
                  },
                }}
              >
                <PaymentForm amount={numAhc} onSuccess={handleSuccess} />
              </Elements>
            ) : (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
