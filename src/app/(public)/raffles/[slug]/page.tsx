"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RaffleProgressBar } from "@/components/raffle/raffle-progress-bar";
import { RaffleCountdown } from "@/components/raffle/raffle-countdown";
import { NumberSelector } from "@/components/raffle/number-selector";
import { useNumberSelection } from "@/hooks/use-number-selection";
import { formatCurrency } from "@/lib/utils";

/* ── Mock data ── */

function getMockRaffle(slug: string) {
  return {
    id: "1",
    title: "PlayStation 5 Slim Digital Edition",
    slug,
    description:
      "Concorra a um PlayStation 5 Slim Digital Edition zerado, lacrado, com garantia de 1 ano. O console vem acompanhado de 1 controle DualSense e cabo HDMI. Sorteio transparente com hash publica e verificavel.",
    pricePerNumber: 2.5,
    totalNumbers: 100,
    maxPerPurchase: 10,
    category: "Eletronicos",
    prizeType: "Console",
    status: "ACTIVE" as const,
    imageUrl: null as string | null,
    drawDate: "2026-05-15T20:00:00Z",
    soldCount: 42,
    availableCount: 58,
  };
}

function generateMockNumbers(total: number) {
  const numbers: { number: number; status: "AVAILABLE" | "RESERVED" | "PAID" }[] = [];
  for (let i = 1; i <= total; i++) {
    let status: "AVAILABLE" | "RESERVED" | "PAID" = "AVAILABLE";
    const rand = Math.random();
    if (rand < 0.3) status = "PAID";
    else if (rand < 0.38) status = "RESERVED";
    numbers.push({ number: i, status });
  }
  return numbers;
}

const statusMap: Record<string, { label: string; variant: "success" | "warning" | "accent" | "danger" | "outline" }> = {
  ACTIVE: { label: "Ativa", variant: "success" },
  PAUSED: { label: "Pausada", variant: "warning" },
  DRAWN: { label: "Sorteada", variant: "accent" },
  CLOSED: { label: "Encerrada", variant: "outline" },
  CANCELLED: { label: "Cancelada", variant: "danger" },
};

export default function RaffleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const raffle = getMockRaffle(slug);
  const numbers = useMemo(() => generateMockNumbers(raffle.totalNumbers), [raffle.totalNumbers]);

  const {
    selectedNumbers,
    toggleNumber,
    selectRandom,
    clearSelection,
    canSelectMore,
    count,
  } = useNumberSelection(raffle.maxPerPurchase);

  const total = count * raffle.pricePerNumber;
  const statusInfo = statusMap[raffle.status] ?? statusMap.ACTIVE;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <a href="/raffles" className="hover:text-primary-500 transition-colors">
          Rifas
        </a>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-[var(--foreground)] font-medium truncate">{raffle.title}</span>
      </nav>

      {/* Main layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Left: Image */}
        <div className="lg:col-span-2">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            {raffle.imageUrl ? (
              <img
                src={raffle.imageUrl}
                alt={raffle.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-600/20 to-accent-500/10">
                <svg
                  className="h-24 w-24 text-primary-600/30"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              <Badge variant="outline">{raffle.category}</Badge>
              <Badge variant="outline">{raffle.prizeType}</Badge>
            </div>

            <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
              {raffle.title}
            </h1>

            <p className="text-[var(--muted-foreground)] leading-relaxed">
              {raffle.description}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <span className="text-sm text-[var(--muted-foreground)]">Valor por numero:</span>
            <span className="text-3xl font-bold text-accent-500">
              {formatCurrency(raffle.pricePerNumber)}
            </span>
          </div>

          {/* Progress */}
          <RaffleProgressBar sold={raffle.soldCount} total={raffle.totalNumbers} />

          {/* Countdown */}
          {raffle.status === "ACTIVE" && raffle.drawDate && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
              <RaffleCountdown targetDate={raffle.drawDate} label="Sorteio em:" />
            </div>
          )}

          {/* Quick info */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total", value: raffle.totalNumbers.toString() },
              { label: "Disponiveis", value: raffle.availableCount.toString() },
              { label: "Vendidos", value: raffle.soldCount.toString() },
              { label: "Max por compra", value: raffle.maxPerPurchase.toString() },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-center"
              >
                <p className="text-xs text-[var(--muted-foreground)]">{item.label}</p>
                <p className="text-lg font-bold text-[var(--foreground)]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Number selector */}
      <div className="mt-10">
        <NumberSelector
          raffleId={raffle.id}
          numbers={numbers}
          maxPerPurchase={raffle.maxPerPurchase}
          pricePerNumber={raffle.pricePerNumber}
          selectedNumbers={selectedNumbers}
          onToggle={toggleNumber}
          onSelectRandom={selectRandom}
          onClear={clearSelection}
          canSelectMore={canSelectMore}
        />
      </div>

      {/* Fixed bottom checkout bar (mobile) */}
      {count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--card)] p-4 shadow-2xl lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">
                {count} {count === 1 ? "numero selecionado" : "numeros selecionados"}
              </p>
              <p className="text-xl font-bold text-primary-500">
                {formatCurrency(total)}
              </p>
            </div>
            <Button size="lg" className="shadow-lg shadow-primary-600/25">
              Comprar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
