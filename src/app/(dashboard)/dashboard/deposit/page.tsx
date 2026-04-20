"use client";

import { useState, useEffect } from "react";
import { loadStripe, type Stripe as StripeType } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Loader2, Tag, X, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useTranslation } from "@/i18n/provider";

const CURRENCIES = [
  { code: "BRL", symbol: "R$", flag: "🇧🇷", name: "Real" },
  { code: "USD", symbol: "$", flag: "🇺🇸", name: "Dólar" },
] as const;

type CurrencyCode = (typeof CURRENCIES)[number]["code"];

const PRESETS_AHC = [10, 25, 50, 100, 250, 500];

// Internal platform rate (must match backend fxService): 1 AHC = $1 USD
const USD_PER_AHC = 1;

// ─── Payment Form (inside Elements) ───
function PaymentForm({ totalAhc, onSuccess }: { totalAhc: number; onSuccess: () => void }) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPaying(true);
    setError(null);

    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (result.error) {
        setError(result.error.message || "Erro no pagamento");
        setPaying(false);
        return;
      }

      const status = result.paymentIntent?.status;
      if (status === "succeeded") {
        onSuccess();
        return;
      }

      // Any other status (requires_action, processing, requires_capture…)
      // means the payment isn't complete. Surface it instead of looping forever.
      if (status === "processing") {
        setError(
          "Pagamento está sendo processado pelo banco. Aguarde alguns segundos e recarregue a página — o saldo será creditado assim que confirmar."
        );
      } else if (status === "requires_action") {
        setError(
          "O banco exigiu autenticação adicional que não foi concluída. Tente novamente."
        );
      } else if (status) {
        setError(`Pagamento retornou status inesperado: ${status}`);
      } else {
        setError("Resposta inesperada do Stripe. Tente novamente.");
      }
      setPaying(false);
    } catch (err) {
      console.error("confirmPayment threw:", err);
      setError(
        err instanceof Error
          ? `Erro: ${err.message}`
          : "Falha ao confirmar pagamento. Verifique sua conexão e tente novamente."
      );
      setPaying(false);
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
          <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> {t("deposit.processing")}</>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ahc-coin.png" alt="" className="h-5 w-5 rounded-full mr-2" />
            {t("deposit.payAndReceive", { total: totalAhc.toFixed(2) })}
          </>
        )}
      </Button>
    </form>
  );
}

// ─── Main Page ───
export default function DepositPage() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>("BRL");
  const [ahcAmount, setAhcAmount] = useState("");
  const [loading, setLoading] = useState(true);

  // FX state for live preview (BRL only needs it)
  const [usdToBrl, setUsdToBrl] = useState<number | null>(null);
  const [fxLoading, setFxLoading] = useState(false);

  // Payment state
  const [stripePromise, setStripePromise] = useState<Promise<StripeType | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState<{
    code: string;
    bonusAhc: number;
    discountType: string;
    discountValue: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    fetch("/api/user/balance")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setBalance(Number(json.data.balance));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load FX rate (BRL only needs it). Refresh every 2 min.
  useEffect(() => {
    let cancelled = false;
    async function loadFx() {
      setFxLoading(true);
      try {
        const res = await fetch("/api/fx/rates", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && json.success) {
          setUsdToBrl(Number(json.data.usdToBrl));
        }
      } catch {
        // ignore — preview will show a placeholder
      } finally {
        if (!cancelled) setFxLoading(false);
      }
    }
    loadFx();
    const id = setInterval(loadFx, 120_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const numAhc = Math.floor(parseFloat(ahcAmount) || 0);
  const currencyInfo = CURRENCIES.find((c) => c.code === currency)!;

  // Compute the live price the user will pay
  const usdAmount = numAhc * USD_PER_AHC;
  const payAmount =
    currency === "USD"
      ? usdAmount
      : usdToBrl !== null
      ? usdAmount * usdToBrl
      : null;

  // If the amount changes after a coupon was applied, drop the coupon (needs revalidation
  // because minOrderAmount/discount may differ at the new amount).
  useEffect(() => {
    if (couponApplied) {
      setCouponApplied(null);
      setCouponError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ahcAmount]);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (numAhc < 1) {
      setCouponError(t("deposit.couponDefineAmountFirst"));
      return;
    }
    setValidatingCoupon(true);
    setCouponError(null);

    try {
      const res = await fetch("/api/deposit/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, amount: numAhc }),
      });
      const json = await res.json();

      if (json.success) {
        setCouponApplied({
          code: json.data.code,
          bonusAhc: Number(json.data.bonusAhc),
          discountType: json.data.discountType,
          discountValue: Number(json.data.discountValue),
        });
        setCouponInput("");
      } else {
        setCouponError(json.error || "Cupom inválido");
      }
    } catch {
      setCouponError("Erro ao validar cupom");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponError(null);
  };

  const handleStartPayment = async () => {
    if (numAhc < 1) return;
    setCreating(true);

    try {
      const res = await fetch("/api/deposit/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAhc,
          currency,
          couponCode: couponApplied?.code,
        }),
      });
      const json = await res.json();

      if (json.success && json.data?.clientSecret && json.data?.publishableKey) {
        setStripePromise(loadStripe(json.data.publishableKey));
        setClientSecret(json.data.clientSecret);
        setShowPayment(true);
      } else {
        addToast({ type: "error", message: json.error || "Erro ao iniciar pagamento" });
      }
    } catch {
      addToast({ type: "error", message: "Erro ao conectar com gateway" });
    } finally {
      setCreating(false);
    }
  };

  const handleSuccess = () => {
    setSuccess(true);
    setShowPayment(false);
    const totalCredit = numAhc + (couponApplied?.bonusAhc ?? 0);
    setBalance((prev) => (prev || 0) + totalCredit);
  };

  const bonusAhc = couponApplied?.bonusAhc ?? 0;
  const totalAhcReceived = numAhc + bonusAhc;

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle className="h-10 w-10 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{t("deposit.successTitle")}</h1>
        <p className="text-surface-400 mb-4">{t("deposit.successSubtitle")}</p>
        <div className="flex items-center gap-2 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ahc-coin.png" alt="AHC" className="h-8 w-8 rounded-full" />
          <span className="text-3xl font-bold text-accent-400">+{totalAhcReceived.toFixed(2)} AHC</span>
        </div>
        <div className="flex gap-3">
          <a
            href="/dashboard/deposit"
            className="rounded-lg border border-surface-700 px-6 py-2.5 text-sm font-medium text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            {t("deposit.depositMore")}
          </a>
          <a
            href="/raffles"
            className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            {t("deposit.viewRaffles")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{t("deposit.title")}</h1>
        <p className="text-[var(--muted-foreground)] mt-1">{t("deposit.subtitle")}</p>
      </div>

      {/* Balance */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ahc-coin.png" alt="AHC" className="h-12 w-12 rounded-full" />
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">{t("balance.yourBalance")}</p>
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
              <CardTitle className="text-base">{t("deposit.currency")}</CardTitle>
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
              <p className="mt-2 text-xs text-surface-500">
                {currency === "USD"
                  ? "1 AHC = $1 USD (taxa fixa)"
                  : usdToBrl !== null
                  ? `1 AHC = $1 USD ≈ R$ ${(USD_PER_AHC * usdToBrl).toFixed(2)} · câmbio ao vivo`
                  : "1 AHC = $1 USD · câmbio ao vivo"}
              </p>
            </CardContent>
          </Card>

          {/* Amount */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("deposit.amount")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {PRESETS_AHC.map((preset) => {
                  const presetUsd = preset * USD_PER_AHC;
                  const presetPrice =
                    currency === "USD"
                      ? presetUsd
                      : usdToBrl !== null
                      ? presetUsd * usdToBrl
                      : null;
                  return (
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
                        {presetPrice !== null
                          ? `${currencyInfo.symbol} ${presetPrice.toFixed(2)}`
                          : "—"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={ahcAmount}
                  onChange={(e) => setAhcAmount(e.target.value)}
                  placeholder={t("deposit.amountCustom")}
                  className="pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-accent-500">AHC</span>
              </div>

              {numAhc > 0 && (
                <div className="rounded-xl border border-surface-700 bg-surface-800/50 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-400">{t("deposit.baseAhc")}</span>
                    <span className="font-semibold text-white">{numAhc} AHC</span>
                  </div>
                  {bonusAhc > 0 && (
                    <div className="flex justify-between">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        {t("deposit.couponBonus")} {couponApplied?.code}
                      </span>
                      <span className="font-semibold text-emerald-400">+{bonusAhc.toFixed(2)} AHC</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-surface-400">{t("deposit.youReceive")}</span>
                    <span className="font-bold text-accent-400">{totalAhcReceived.toFixed(2)} AHC</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-surface-400">{t("deposit.youPay")}</span>
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        {currencyInfo.flag} {currencyInfo.symbol}{" "}
                        {payAmount !== null ? payAmount.toFixed(2) : fxLoading ? "…" : "—"}
                      </div>
                      {currency === "BRL" && usdToBrl !== null && (
                        <div className="text-[10px] text-surface-500 mt-0.5">
                          ≈ ${usdAmount.toFixed(2)} USD · taxa 1 USD = R$ {usdToBrl.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  <hr className="border-surface-700" />
                  <div className="flex justify-between">
                    <span className="text-surface-400">{t("deposit.balanceAfter")}</span>
                    <span className="font-bold text-accent-400">{((balance || 0) + totalAhcReceived).toFixed(2)} AHC</span>
                  </div>
                </div>
              )}

              {/* Coupon */}
              <div className="rounded-xl border border-surface-700 bg-surface-800/30 p-3 space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-surface-300">
                  <Tag className="h-3.5 w-3.5 text-accent-400" />
                  {t("deposit.couponLabel")}
                </label>

                {couponApplied ? (
                  <div className="flex items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                      <div className="text-sm">
                        <span className="font-bold text-emerald-400">{couponApplied.code}</span>
                        <span className="text-surface-400 ml-2">
                          +{couponApplied.bonusAhc.toFixed(2)} AHC de bônus
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-surface-400 hover:text-red-400 transition-colors"
                      aria-label="Remover cupom"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder={t("deposit.couponPlaceholder")}
                        disabled={validatingCoupon || numAhc < 1}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        className="font-mono uppercase"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponInput.trim() || numAhc < 1}
                      >
                        {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : t("deposit.couponApply")}
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-red-400">{couponError}</p>
                    )}
                  </>
                )}
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={numAhc < 1 || creating}
                onClick={handleStartPayment}
              >
                {creating ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> {t("deposit.preparingPayment")}</>
                ) : (
                  t("deposit.continueToPayment")
                )}
              </Button>

              <p className="text-center text-xs text-surface-500">{t("deposit.securePayment")}</p>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Payment form */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{t("deposit.paymentTitle")}</CardTitle>
                <CardDescription>
                  {totalAhcReceived.toFixed(2)} AHC
                  {bonusAhc > 0 && (
                    <span className="text-emerald-400"> (+{bonusAhc.toFixed(2)} bônus)</span>
                  )}{" "}
                  • {currencyInfo.flag} {currencyInfo.symbol}{" "}
                  {payAmount !== null ? payAmount.toFixed(2) : "—"}
                </CardDescription>
              </div>
              <button
                onClick={() => { setShowPayment(false); setClientSecret(null); }}
                className="text-sm text-surface-400 hover:text-white transition-colors"
              >
                ← {t("common.back")}
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
                <PaymentForm totalAhc={totalAhcReceived} onSuccess={handleSuccess} />
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
