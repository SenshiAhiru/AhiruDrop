"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, X, CheckCircle, Loader2, AlertCircle } from "lucide-react";

interface NumberInfo {
  number: number;
  status: "AVAILABLE" | "RESERVED" | "PAID";
}

interface NumberSelectorProps {
  raffleId: string;
  numbers: NumberInfo[];
  maxPerPurchase: number;
  pricePerNumber: number;
  selectedNumbers: number[];
  onToggle: (num: number) => void;
  onSelectRandom: (availableNumbers: NumberInfo[], count: number) => void;
  onClear: () => void;
  canSelectMore: boolean;
  className?: string;
}

export function NumberSelector({
  raffleId,
  numbers,
  maxPerPurchase,
  pricePerNumber,
  selectedNumbers,
  onToggle,
  onSelectRandom,
  onClear,
  canSelectMore,
  className,
}: NumberSelectorProps) {
  const [search, setSearch] = useState("");
  const [buyModal, setBuyModal] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    numbers: number[];
    spent: number;
    balance: number;
  } | null>(null);

  async function handleConfirmPurchase() {
    if (buying) return;
    setBuying(true);
    setError(null);

    try {
      const res = await fetch(`/api/raffles/${raffleId}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numbers: selectedNumbers }),
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.error || "Erro ao processar compra");
        setBuying(false);
        return;
      }

      setSuccessData({
        numbers: json.data.numbers,
        spent: Number(json.data.spent),
        balance: Number(json.data.balance),
      });
      setBuyModal(false);
      setBuying(false);
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setBuying(false);
    }
  }

  function closeSuccess() {
    setSuccessData(null);
    onClear();
    // Reload to refresh number grid + balance in header
    if (typeof window !== "undefined") window.location.reload();
  }

  const totalDigits = useMemo(() => {
    const max = Math.max(...numbers.map((n) => n.number), 0);
    return String(max).length;
  }, [numbers]);

  const formatNumber = (num: number) => String(num).padStart(totalDigits, "0");

  const filteredNumbers = useMemo(() => {
    if (!search.trim()) return numbers;
    const query = search.trim();
    return numbers.filter((n) => formatNumber(n.number).includes(query));
  }, [numbers, search, totalDigits]);

  const total = selectedNumbers.length * pricePerNumber;

  function getNumberClasses(num: number, status: NumberInfo["status"]) {
    const selected = selectedNumbers.includes(num);

    if (selected) {
      return "bg-primary-500/20 text-primary-400 ring-1 ring-primary-500/40 scale-105";
    }

    switch (status) {
      case "AVAILABLE":
        return cn(
          "bg-surface-800/60 text-surface-200",
          canSelectMore && "hover:bg-surface-700/80 hover:text-white hover:ring-1 hover:ring-surface-600 cursor-pointer"
        );
      case "RESERVED":
        return "bg-amber-500/10 text-amber-400/70 ring-1 ring-amber-500/20 cursor-not-allowed line-through opacity-70";
      case "PAID":
        return "bg-emerald-500/10 text-emerald-400/80 ring-1 ring-emerald-500/30 cursor-not-allowed line-through";
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--foreground)]">
            Escolha seus números
          </h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            <span className="font-semibold text-primary-500">{selectedNumbers.length}</span>
            /{maxPerPurchase} selecionados
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectRandom(numbers, 5)}
            disabled={numbers.filter((n) => n.status === "AVAILABLE").length === 0}
          >
            5 aleatórios
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectRandom(numbers, 10)}
            disabled={numbers.filter((n) => n.status === "AVAILABLE").length === 0}
          >
            10 aleatórios
          </Button>
          {selectedNumbers.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <Input
          type="text"
          placeholder="Buscar número..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Number grid */}
      <div className="max-h-[420px] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 scrollbar-thin">
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
          {filteredNumbers.map(({ number, status }) => (
            <button
              key={number}
              type="button"
              disabled={status !== "AVAILABLE" && !selectedNumbers.includes(number)}
              onClick={() => {
                if (status === "AVAILABLE" || selectedNumbers.includes(number)) {
                  onToggle(number);
                }
              }}
              className={cn(
                "h-10 w-full rounded-lg text-xs sm:text-sm font-mono transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                getNumberClasses(number, status)
              )}
            >
              {formatNumber(number)}
            </button>
          ))}
        </div>

        {filteredNumbers.length === 0 && (
          <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
            Nenhum número encontrado.
          </p>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted-foreground)]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-surface-800/60" />
          Disponível
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-amber-500/20 ring-1 ring-amber-500/30" />
          Reservado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-emerald-500/20 ring-1 ring-emerald-500/40" />
          Vendido
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-primary-500/30 ring-1 ring-primary-500/50" />
          Selecionado
        </span>
      </div>

      {/* Bottom summary */}
      {selectedNumbers.length > 0 && (
        <div className="rounded-xl border border-surface-700 bg-surface-800/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--muted-foreground)]">
              {selectedNumbers.length} {selectedNumbers.length === 1 ? "cota selecionada" : "cotas selecionadas"}
            </p>
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ahc-coin.png" alt="AHC" className="h-5 w-5 rounded-full" />
              <span className="text-2xl font-bold text-accent-400">{total.toFixed(2)} AHC</span>
            </div>
          </div>
          <Button
            size="lg"
            className="w-full shadow-lg shadow-primary-600/25"
            onClick={() => setBuyModal(true)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ahc-coin.png" alt="" className="h-5 w-5 rounded-full mr-2" />
            Comprar com {total.toFixed(2)} AHC
          </Button>
        </div>
      )}

      {/* Buy Modal */}
      {buyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setBuyModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-surface-700 bg-surface-900 p-6 shadow-2xl">
            <button
              onClick={() => setBuyModal(false)}
              className="absolute top-4 right-4 text-surface-500 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-500/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/ahc-coin.png" alt="AHC" className="h-10 w-10 rounded-full" />
              </div>

              <h3 className="text-lg font-bold text-white mb-1">Confirmar compra</h3>
              <p className="text-sm text-surface-400 mb-5">Revise os detalhes antes de confirmar</p>

              {/* Details */}
              <div className="w-full rounded-xl border border-surface-700 bg-surface-800/50 p-4 mb-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-400">Cotas</span>
                  <span className="font-semibold text-white">{selectedNumbers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Preço por cota</span>
                  <span className="font-semibold text-white">{pricePerNumber} AHC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Números</span>
                  <span className="font-mono text-xs text-surface-300 max-w-[200px] truncate text-right">
                    {selectedNumbers.sort((a, b) => a - b).join(", ")}
                  </span>
                </div>
                <hr className="border-surface-700" />
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Total</span>
                  <div className="flex items-center gap-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/ahc-coin.png" alt="" className="h-5 w-5 rounded-full" />
                    <span className="text-lg font-bold text-accent-400">{total.toFixed(2)} AHC</span>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="w-full mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-left text-sm text-red-400 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => { setBuyModal(false); setError(null); }}
                  disabled={buying}
                  className="flex-1 rounded-lg border border-surface-700 px-4 py-2.5 text-sm font-medium text-surface-400 hover:text-white hover:bg-surface-800 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  disabled={buying}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {buying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Confirmar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeSuccess} />
          <div className="relative w-full max-w-md rounded-2xl border border-emerald-500/30 bg-surface-900 p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle className="h-9 w-9 text-emerald-400" />
              </div>

              <h3 className="text-xl font-bold text-white mb-1">Compra confirmada!</h3>
              <p className="text-sm text-surface-400 mb-5">
                Seus números foram reservados pra você. Boa sorte! 🍀
              </p>

              <div className="w-full rounded-xl border border-surface-700 bg-surface-800/50 p-4 mb-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-400">Cotas compradas</span>
                  <span className="font-semibold text-white">{successData.numbers.length}</span>
                </div>
                <div className="flex justify-between items-start gap-3">
                  <span className="text-surface-400 flex-shrink-0">Números</span>
                  <span className="font-mono text-xs text-surface-300 text-right break-all">
                    {successData.numbers.sort((a, b) => a - b).join(", ")}
                  </span>
                </div>
                <hr className="border-surface-700" />
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Total debitado</span>
                  <div className="flex items-center gap-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/ahc-coin.png" alt="" className="h-4 w-4 rounded-full" />
                    <span className="font-bold text-red-400">-{successData.spent.toFixed(2)} AHC</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Saldo atual</span>
                  <div className="flex items-center gap-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/ahc-coin.png" alt="" className="h-4 w-4 rounded-full" />
                    <span className="font-bold text-accent-400">{successData.balance.toFixed(2)} AHC</span>
                  </div>
                </div>
              </div>

              <button
                onClick={closeSuccess}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
