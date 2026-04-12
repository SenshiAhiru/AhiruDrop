"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { RaffleCard } from "@/components/raffle/raffle-card";
import { RaffleGrid } from "@/components/raffle/raffle-grid";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Raffle = {
  id: string;
  title: string;
  slug: string;
  featuredImage: string;
  pricePerNumber: number;
  stats: { available: number; paid: number; total: number };
  status: "ACTIVE" | "PAUSED" | "DRAWN" | "CLOSED" | "CANCELLED";
  scheduledDrawAt: string | null;
  skinRarity: string;
  skinRarityColor: string;
  skinWear: string;
  skinWeapon: string;
};

type CategoryFilter = "ALL" | "Rifle" | "Knife" | "Gloves" | "Pistol" | "Sniper Rifle";

export default function RafflesPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    async function fetchRaffles() {
      try {
        const res = await fetch("/api/raffles?status=ACTIVE&limit=20");
        const json = await res.json();
        if (json.success && json.data?.data) {
          const mapped: Raffle[] = json.data.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            featuredImage: item.skinImage || item.featuredImage,
            pricePerNumber: Number(item.pricePerNumber),
            stats: item.stats || { available: 0, paid: 0, total: 0 },
            status: item.status,
            scheduledDrawAt: item.scheduledDrawAt || null,
            skinRarity: item.skinRarity || "",
            skinRarityColor: item.skinRarityColor || "",
            skinWear: item.skinWear || "",
            skinWeapon: item.skinWeapon || "",
          }));
          setRaffles(mapped);
        }
      } catch (err) {
        console.error("Erro ao buscar rifas:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRaffles();
  }, []);

  const filteredRaffles = useMemo(() => {
    let result = raffles;

    if (categoryFilter !== "ALL") {
      result = result.filter((r) => r.skinWeapon && getCategoryFromWeapon(r.skinWeapon) === categoryFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.title.toLowerCase().includes(q));
    }

    return result;
  }, [raffles, categoryFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRaffles.length / perPage));
  const paginatedRaffles = filteredRaffles.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Rifas de Skins CS2</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Explore todas as rifas de skins disponíveis. Armas, facas, luvas e muito mais.
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
            placeholder="Buscar skins..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>

        <Select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value as CategoryFilter);
            setPage(1);
          }}
          className="w-full sm:w-48"
        >
          <option value="ALL">Todas as Categorias</option>
          <option value="Rifle">Rifles</option>
          <option value="Pistol">Pistolas</option>
          <option value="Sniper Rifle">Snipers</option>
          <option value="Knife">Facas</option>
          <option value="Gloves">Luvas</option>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          ))}
        </div>
      ) : paginatedRaffles.length > 0 ? (
        <RaffleGrid loading={false} emptyMessage="Nenhuma skin encontrada com os filtros selecionados.">
          {paginatedRaffles.map((raffle) => (
            <RaffleCard key={raffle.id} raffle={raffle} />
          ))}
        </RaffleGrid>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] py-16 text-center">
          <svg className="h-12 w-12 text-[var(--muted-foreground)] mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
          </svg>
          <p className="text-lg font-semibold text-[var(--foreground)]">
            Nenhuma rifa disponível no momento
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Volte em breve para conferir novas rifas de skins CS2.
          </p>
        </div>
      )}

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
            Página {page} de {totalPages}
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

/** Map weapon names to categories for filtering */
function getCategoryFromWeapon(weapon: string): string {
  const knives = ["Karambit", "Butterfly Knife", "Bayonet", "Flip Knife", "Gut Knife", "Falchion Knife", "Shadow Daggers", "Bowie Knife", "Huntsman Knife", "Navaja Knife", "Stiletto Knife", "Talon Knife", "Ursus Knife", "Classic Knife", "Paracord Knife", "Survival Knife", "Nomad Knife", "Skeleton Knife", "Kukri Knife"];
  const gloves = ["Sport Gloves", "Specialist Gloves", "Driver Gloves", "Hand Wraps", "Moto Gloves", "Hydra Gloves", "Broken Fang Gloves"];
  const snipers = ["AWP", "SSG 08", "SCAR-20", "G3SG1"];
  const pistols = ["Desert Eagle", "USP-S", "Glock-18", "P250", "Five-SeveN", "Tec-9", "CZ75-Auto", "R8 Revolver", "P2000", "Dual Berettas"];

  if (knives.includes(weapon)) return "Knife";
  if (gloves.includes(weapon)) return "Gloves";
  if (snipers.includes(weapon)) return "Sniper Rifle";
  if (pistols.includes(weapon)) return "Pistol";
  return "Rifle";
}
