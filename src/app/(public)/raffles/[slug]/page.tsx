"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { NumberSelector } from "@/components/raffle/number-selector";
import { formatCurrency, calculatePercentage } from "@/lib/utils";
import { getWearShortName, getWearColor, getRarityColor } from "@/constants/cs2";

interface RaffleStats {
  available: number;
  reserved: number;
  paid: number;
  total: number;
}

interface Raffle {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
  pricePerNumber: number;
  totalNumbers: number;
  maxPerPurchase: number;
  featuredImage: string | null;
  skinImage: string | null;
  skinName: string | null;
  skinWeapon: string | null;
  skinWear: string | null;
  skinRarity: string | null;
  skinRarityColor: string | null;
  skinStatTrak: boolean;
  skinMarketPrice: number | null;
  scheduledDrawAt: string | null;
  stats: RaffleStats;
}

const statusMap: Record<
  string,
  { label: string; variant: "success" | "warning" | "accent" | "danger" | "outline" }
> = {
  ACTIVE: { label: "Ativa", variant: "success" },
  PAUSED: { label: "Pausada", variant: "warning" },
  DRAWN: { label: "Sorteada", variant: "accent" },
  CLOSED: { label: "Encerrada", variant: "outline" },
  CANCELLED: { label: "Cancelada", variant: "danger" },
};

function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!targetDate) return;

    function update() {
      const now = Date.now();
      const target = new Date(targetDate!).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("Sorteio em breve!");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const parts: string[] = [];
      if (days > 0) parts.push(`${days}d`);
      parts.push(`${String(hours).padStart(2, "0")}h`);
      parts.push(`${String(minutes).padStart(2, "0")}m`);
      parts.push(`${String(seconds).padStart(2, "0")}s`);
      setTimeLeft(parts.join(" "));
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

export default function RaffleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

  const countdown = useCountdown(raffle?.scheduledDrawAt ?? null);

  useEffect(() => {
    async function fetchRaffle() {
      try {
        const res = await fetch(`/api/raffles/${slug}`);
        if (!res.ok) {
          setError(true);
          return;
        }
        const json = await res.json();
        if (!json.success || !json.data) {
          setError(true);
          return;
        }
        setRaffle(json.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchRaffle();
  }, [slug]);

  const numbers = useMemo(() => {
    if (!raffle) return [];
    const { stats } = raffle;
    const result: { number: number; status: "AVAILABLE" | "RESERVED" | "PAID" }[] = [];
    for (let i = 1; i <= raffle.totalNumbers; i++) {
      let status: "AVAILABLE" | "RESERVED" | "PAID" = "AVAILABLE";
      if (i <= stats.paid) {
        status = "PAID";
      } else if (i <= stats.paid + stats.reserved) {
        status = "RESERVED";
      }
      result.push({ number: i, status });
    }
    return result;
  }, [raffle]);

  const maxPerPurchase = raffle?.maxPerPurchase ?? 100;
  const canSelectMore = selectedNumbers.length < maxPerPurchase;

  const handleToggle = useCallback(
    (num: number) => {
      setSelectedNumbers((prev) => {
        if (prev.includes(num)) return prev.filter((n) => n !== num);
        if (prev.length >= maxPerPurchase) return prev;
        return [...prev, num];
      });
    },
    [maxPerPurchase]
  );

  const handleSelectRandom = useCallback(
    (allNumbers: { number: number; status: string }[], count: number) => {
      const available = allNumbers
        .filter((n) => n.status === "AVAILABLE" && !selectedNumbers.includes(n.number))
        .map((n) => n.number);
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      const toAdd = shuffled.slice(0, Math.min(count, maxPerPurchase - selectedNumbers.length));
      setSelectedNumbers((prev) => [...prev, ...toAdd]);
    },
    [selectedNumbers, maxPerPurchase]
  );

  const handleClear = useCallback(() => {
    setSelectedNumbers([]);
  }, []);

  // Loading state
  if (loading) {
    return <RaffleDetailSkeleton />;
  }

  // Error / not found
  if (error || !raffle) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] py-20 text-center">
          <svg
            className="h-16 w-16 text-[var(--muted-foreground)] mb-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Rifa não encontrada
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            A rifa que você procura não existe ou foi removida.
          </p>
          <Link href="/raffles">
            <Button variant="outline" className="mt-6">
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
              Voltar para rifas
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const imageSrc = raffle.skinImage || raffle.featuredImage || "/placeholder-skin.png";
  const rarityColor = raffle.skinRarityColor || getRarityColor(raffle.skinRarity || "");
  const paidPercentage = calculatePercentage(raffle.stats.paid, raffle.totalNumbers);
  const statusInfo = statusMap[raffle.status];

  return (
    <div className="min-h-screen">
      {/* Hero section with skin showcase */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `radial-gradient(ellipse at center top, ${rarityColor}18 0%, transparent 60%)`,
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Link href="/raffles" className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-8">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Voltar para rifas
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Left: Skin Image */}
            <div className="flex flex-col items-center">
              <div
                className="relative w-full max-w-lg aspect-square rounded-2xl flex items-center justify-center p-8"
                style={{
                  background: `radial-gradient(circle at center, ${rarityColor}20, transparent 70%)`,
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl border-2 opacity-30"
                  style={{ borderColor: rarityColor }}
                />
                <img
                  src={imageSrc}
                  alt={raffle.title}
                  className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
                  draggable={false}
                />
              </div>

              {/* Market price */}
              {raffle.skinMarketPrice != null && raffle.skinMarketPrice > 0 && (
                <div className="mt-4 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                  </svg>
                  Preço de mercado: {formatCurrency(raffle.skinMarketPrice)}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {statusInfo && (
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                )}
                {raffle.skinRarity && (
                  <Badge
                    style={{ backgroundColor: `${rarityColor}20`, color: rarityColor, borderColor: `${rarityColor}40` }}
                    className="border"
                  >
                    {raffle.skinRarity}
                  </Badge>
                )}
                {raffle.skinWear && (
                  <Badge
                    style={{ backgroundColor: `${getWearColor(raffle.skinWear)}20`, color: getWearColor(raffle.skinWear) }}
                  >
                    {getWearShortName(raffle.skinWear)}
                  </Badge>
                )}
                {raffle.skinStatTrak && (
                  <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/40">
                    StatTrak
                  </Badge>
                )}
              </div>

              {/* Title */}
              <div>
                {raffle.skinWeapon && (
                  <p className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    {raffle.skinWeapon}
                  </p>
                )}
                <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mt-1">
                  {raffle.title}
                </h1>
              </div>

              {/* Price */}
              <div className="rounded-xl border border-accent-500/20 bg-accent-500/5 p-5">
                <p className="text-sm text-[var(--muted-foreground)]">Preço por cota</p>
                <div className="flex items-center gap-2 mt-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/ahc-coin.png" alt="AHC" className="h-8 w-8 rounded-full" />
                  <p className="text-3xl font-bold text-accent-400">
                    {raffle.pricePerNumber} <span className="text-lg">AHC</span>
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Progresso da rifa</span>
                  <span className="font-semibold text-[var(--foreground)]">{paidPercentage}%</span>
                </div>
                <Progress value={paidPercentage} />
                <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
                  <span>
                    <span className="font-semibold text-[var(--foreground)]">{raffle.stats.paid}</span> de{" "}
                    <span className="font-semibold text-[var(--foreground)]">{raffle.totalNumbers}</span> cotas vendidas
                  </span>
                  <span>{raffle.stats.available} disponíveis</span>
                </div>
              </div>

              {/* Countdown */}
              {raffle.scheduledDrawAt && countdown && (
                <div className="flex items-center gap-3 rounded-xl border border-accent-500/30 bg-accent-500/5 p-4">
                  <svg className="h-5 w-5 text-accent-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Sorteio em</p>
                    <p className="text-lg font-bold font-mono text-accent-400">{countdown}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              {raffle.description && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">Descrição</h3>
                  <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap leading-relaxed">
                    {raffle.description}
                  </p>
                </div>
              )}

              {/* CTA */}
              <Button
                size="lg"
                className="w-full shadow-lg shadow-primary-600/25 text-lg h-14"
                onClick={() => {
                  const el = document.getElementById("number-selector");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Participar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Number Selector Section */}
      <div id="number-selector" className="mx-auto max-w-7xl px-6 py-10 scroll-mt-20">
        <NumberSelector
          raffleId={raffle.id}
          numbers={numbers}
          maxPerPurchase={maxPerPurchase}
          pricePerNumber={raffle.pricePerNumber}
          selectedNumbers={selectedNumbers}
          onToggle={handleToggle}
          onSelectRandom={handleSelectRandom}
          onClear={handleClear}
          canSelectMore={canSelectMore}
        />
      </div>
    </div>
  );
}

function RaffleDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Skeleton className="h-4 w-32 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Skeleton className="aspect-square w-full max-w-lg rounded-2xl" />
        <div className="space-y-6">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-80 mt-2" />
          </div>
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-full rounded-full" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
