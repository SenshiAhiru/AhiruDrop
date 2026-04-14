"use client";

import { useState, useMemo } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
          "bg-surface-800/60 text-surface-300",
          canSelectMore && "hover:bg-surface-700/80 hover:text-white hover:ring-1 hover:ring-surface-600 cursor-pointer"
        );
      case "RESERVED":
        return "bg-surface-800/30 text-surface-600 cursor-not-allowed";
      case "PAID":
        return "bg-surface-800/20 text-surface-700 cursor-not-allowed";
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
          <span className="inline-block h-3 w-3 rounded-sm bg-surface-100 dark:bg-surface-800 border border-[var(--border)]" />
          Disponível
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-surface-300 dark:bg-surface-700 opacity-60" />
          Reservado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-surface-400 dark:bg-surface-600 opacity-40" />
          Pago
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
            onClick={() => {
              alert(`Funcionalidade em implementação!\n\nResumo:\n${selectedNumbers.length} cotas × ${pricePerNumber} AHC = ${total.toFixed(2)} AHC\nNúmeros: ${selectedNumbers.join(", ")}`);
            }}
          >
            <img src="/ahc-coin.png" alt="" className="h-5 w-5 rounded-full mr-2" />
            Comprar com {total.toFixed(2)} AHC
          </Button>
        </div>
      )}
    </div>
  );
}
