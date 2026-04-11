"use client";

import Link from "next/link";
import Image from "next/image";
import { cn, formatCurrency, calculatePercentage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RaffleCountdown } from "./raffle-countdown";

type RaffleStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "DRAWN" | "CANCELLED";

interface RaffleCardProps {
  raffle: {
    id: string;
    title: string;
    slug: string;
    featuredImage: string | null;
    pricePerNumber: number;
    stats: {
      available: number;
      paid: number;
      total: number;
    };
    status: RaffleStatus;
    scheduledDrawAt: string | null;
  };
  className?: string;
}

const statusConfig: Record<RaffleStatus, { label: string; variant: "default" | "accent" | "success" | "warning" | "danger" }> = {
  DRAFT: { label: "Rascunho", variant: "outline" as const },
  ACTIVE: { label: "Ativa", variant: "success" },
  PAUSED: { label: "Pausada", variant: "warning" },
  DRAWN: { label: "Sorteada", variant: "accent" },
  CANCELLED: { label: "Cancelada", variant: "danger" },
};

export function RaffleCard({ raffle, className }: RaffleCardProps) {
  const { title, slug, featuredImage, pricePerNumber, stats, status, scheduledDrawAt } = raffle;
  const percentage = calculatePercentage(stats.paid, stats.total);
  const statusInfo = statusConfig[status] ?? statusConfig.ACTIVE;
  const isDrawn = status === "DRAWN";

  return (
    <Link
      href={`/raffles/${slug}`}
      className={cn(
        "group block w-full rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-sm",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary-600/10 hover:border-primary-600/30",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden rounded-t-xl">
        {featuredImage ? (
          <Image
            src={featuredImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-600/20 to-accent-500/20">
            <svg
              className="h-12 w-12 text-primary-600/40"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z"
              />
            </svg>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute right-2 top-2">
          <Badge variant={statusInfo.variant} className="shadow-md text-[10px] uppercase tracking-wider">
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-4">
        <h3 className="truncate text-lg font-bold text-[var(--foreground)] group-hover:text-primary-500 transition-colors">
          {title}
        </h3>

        <div className="flex items-baseline gap-1.5">
          <span className="text-xs text-[var(--muted-foreground)]">por cota</span>
          <span className="text-lg font-bold text-accent-500">
            {formatCurrency(pricePerNumber)}
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <Progress value={percentage} className="h-2" />
          <p className="text-xs text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--foreground)]">{stats.paid}</span>
            /{stats.total} vendidos
          </p>
        </div>

        {/* Countdown */}
        {status === "ACTIVE" && scheduledDrawAt && (
          <RaffleCountdown targetDate={scheduledDrawAt} label="Sorteio em:" compact />
        )}

        {/* CTA */}
        <Button
          variant={isDrawn ? "accent" : "default"}
          size="sm"
          className="mt-1 w-full"
          tabIndex={-1}
        >
          {isDrawn ? "Ver Resultado" : "Participar"}
        </Button>
      </div>
    </Link>
  );
}
