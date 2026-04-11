"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { RaffleCard } from "@/components/raffle/raffle-card";
import { RaffleGrid } from "@/components/raffle/raffle-grid";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/* ── Mock data (fallback until API is connected) ── */

const MOCK_RAFFLES = [
  {
    id: "1",
    title: "PlayStation 5 Slim Digital Edition",
    slug: "playstation-5-slim-digital",
    featuredImage: null,
    pricePerNumber: 2.5,
    stats: { available: 720, paid: 280, total: 1000 },
    status: "ACTIVE" as const,
    scheduledDrawAt: "2026-05-15T20:00:00Z",
  },
  {
    id: "2",
    title: "iPhone 16 Pro Max 256GB",
    slug: "iphone-16-pro-max",
    featuredImage: null,
    pricePerNumber: 5.0,
    stats: { available: 150, paid: 850, total: 1000 },
    status: "ACTIVE" as const,
    scheduledDrawAt: "2026-04-30T20:00:00Z",
  },
  {
    id: "3",
    title: "PC Gamer RTX 4070 Super",
    slug: "pc-gamer-rtx-4070-super",
    featuredImage: null,
    pricePerNumber: 10.0,
    stats: { available: 320, paid: 180, total: 500 },
    status: "ACTIVE" as const,
    scheduledDrawAt: "2026-06-01T20:00:00Z",
  },
  {
    id: "4",
    title: "Nintendo Switch OLED + 3 Jogos",
    slug: "nintendo-switch-oled-3-jogos",
    featuredImage: null,
    pricePerNumber: 1.5,
    stats: { available: 0, paid: 500, total: 500 },
    status: "DRAWN" as const,
    scheduledDrawAt: null,
  },
  {
    id: "5",
    title: "Smart TV Samsung 65'' 4K QLED",
    slug: "smart-tv-samsung-65-4k-qled",
    featuredImage: null,
    pricePerNumber: 3.0,
    stats: { available: 400, paid: 600, total: 1000 },
    status: "ACTIVE" as const,
    scheduledDrawAt: "2026-05-20T20:00:00Z",
  },
  {
    id: "6",
    title: "AirPods Pro 2 + Apple Watch SE",
    slug: "airpods-pro-2-apple-watch-se",
    featuredImage: null,
    pricePerNumber: 2.0,
    stats: { available: 50, paid: 250, total: 300 },
    status: "ACTIVE" as const,
    scheduledDrawAt: "2026-05-10T20:00:00Z",
  },
  {
    id: "7",
    title: "Xbox Series X + Game Pass Ultimate",
    slug: "xbox-series-x-game-pass",
    featuredImage: null,
    pricePerNumber: 4.0,
    stats: { available: 0, paid: 500, total: 500 },
    status: "DRAWN" as const,
    scheduledDrawAt: null,
  },
  {
    id: "8",
    title: "Cadeira Gamer ThunderX3 + Headset",
    slug: "cadeira-gamer-thunderx3-headset",
    featuredImage: null,
    pricePerNumber: 1.0,
    stats: { available: 180, paid: 120, total: 300 },
    status: "PAUSED" as const,
    scheduledDrawAt: "2026-06-15T20:00:00Z",
  },
];

type StatusFilter = "ALL" | "ACTIVE" | "CLOSED" | "DRAWN";

export default function RafflesPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  /* For now use mock data; later this will be replaced by useQuery */
  const filteredRaffles = useMemo(() => {
    let result = MOCK_RAFFLES;

    if (statusFilter !== "ALL") {
      if (statusFilter === "CLOSED") {
        result = result.filter((r) => r.status === "PAUSED" || r.status === "CANCELLED");
      } else {
        result = result.filter((r) => r.status === statusFilter);
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.title.toLowerCase().includes(q));
    }

    return result;
  }, [statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRaffles.length / perPage));
  const paginatedRaffles = filteredRaffles.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Rifas</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Explore todas as rifas disponiveis e encontre o premio ideal.
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <Input
            type="text"
            placeholder="Buscar rifas..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>

        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as StatusFilter);
            setPage(1);
          }}
          className="w-full sm:w-48"
        >
          <option value="ALL">Todas</option>
          <option value="ACTIVE">Ativas</option>
          <option value="CLOSED">Encerradas</option>
          <option value="DRAWN">Sorteadas</option>
        </Select>
      </div>

      {/* Grid */}
      <RaffleGrid loading={false} emptyMessage="Nenhuma rifa encontrada com os filtros selecionados.">
        {paginatedRaffles.length > 0
          ? paginatedRaffles.map((raffle) => (
              <RaffleCard key={raffle.id} raffle={raffle} />
            ))
          : null}
      </RaffleGrid>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Anterior
          </Button>

          <span className="px-4 text-sm text-[var(--muted-foreground)]">
            Pagina {page} de {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Proxima
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
}
