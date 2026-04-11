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
    title: "AK-47 | Asiimov (Field-Tested)",
    slug: "ak47-asiimov-ft",
    featuredImage: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXp-K9FDG6SUIOYyJz_BlO9RkbaYMhk/",
    pricePerNumber: 2.50,
    stats: { available: 720, paid: 280, total: 1000 },
    status: "ACTIVE" as const,
    scheduledDrawAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    skinRarity: "Classified",
    skinRarityColor: "#d32ce6",
    skinWear: "Field-Tested",
    skinWeapon: "AK-47",
  },
  {
    id: "2",
    title: "Karambit | Doppler (Factory New)",
    slug: "karambit-doppler-fn",
    featuredImage: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXp-K9FDG6SUIOYyJz_BlO9RkbaYMhk/",
    pricePerNumber: 10.00,
    stats: { available: 150, paid: 850, total: 1000 },
    status: "ACTIVE" as const,
    scheduledDrawAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    skinRarity: "Covert",
    skinRarityColor: "#eb4b4b",
    skinWear: "Factory New",
    skinWeapon: "Karambit",
  },
  {
    id: "3",
    title: "AWP | Dragon Lore (Minimal Wear)",
    slug: "awp-dragon-lore-mw",
    featuredImage: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXp-K9FDG6SUIOYyJz_BlO9RkbaYMhk/",
    pricePerNumber: 25.00,
    stats: { available: 5000, paid: 5000, total: 10000 },
    status: "DRAWN" as const,
    scheduledDrawAt: null,
    skinRarity: "Covert",
    skinRarityColor: "#eb4b4b",
    skinWear: "Minimal Wear",
    skinWeapon: "AWP",
  },
  {
    id: "4",
    title: "Sport Gloves | Pandora's Box (Minimal Wear)",
    slug: "sport-gloves-pandoras-box-mw",
    featuredImage: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXp-K9FDG6SUIOYyJz_BlO9RkbaYMhk/",
    pricePerNumber: 5.00,
    stats: { available: 300, paid: 200, total: 500 },
    status: "ACTIVE" as const,
    scheduledDrawAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    skinRarity: "Extraordinary",
    skinRarityColor: "#e4ae39",
    skinWear: "Minimal Wear",
    skinWeapon: "Sport Gloves",
  },
  {
    id: "5",
    title: "M4A4 | Howl (Factory New)",
    slug: "m4a4-howl-fn",
    featuredImage: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXp-K9FDG6SUIOYyJz_BlO9RkbaYMhk/",
    pricePerNumber: 15.00,
    stats: { available: 400, paid: 600, total: 1000 },
    status: "ACTIVE" as const,
    scheduledDrawAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    skinRarity: "Contraband",
    skinRarityColor: "#e4ae39",
    skinWear: "Factory New",
    skinWeapon: "M4A4",
  },
  {
    id: "6",
    title: "Desert Eagle | Blaze (Factory New)",
    slug: "deagle-blaze-fn",
    featuredImage: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXp-K9FDG6SUIOYyJz_BlO9RkbaYMhk/",
    pricePerNumber: 2.00,
    stats: { available: 50, paid: 250, total: 300 },
    status: "ACTIVE" as const,
    scheduledDrawAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    skinRarity: "Restricted",
    skinRarityColor: "#8847ff",
    skinWear: "Factory New",
    skinWeapon: "Desert Eagle",
  },
  {
    id: "7",
    title: "Butterfly Knife | Fade (Factory New)",
    slug: "butterfly-fade-fn",
    featuredImage: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXp-K9FDG6SUIOYyJz_BlO9RkbaYMhk/",
    pricePerNumber: 8.00,
    stats: { available: 0, paid: 500, total: 500 },
    status: "DRAWN" as const,
    scheduledDrawAt: null,
    skinRarity: "Covert",
    skinRarityColor: "#eb4b4b",
    skinWear: "Factory New",
    skinWeapon: "Butterfly Knife",
  },
  {
    id: "8",
    title: "Specialist Gloves | Crimson Kimono (Field-Tested)",
    slug: "specialist-gloves-crimson-kimono-ft",
    featuredImage: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXp-K9FDG6SUIOYyJz_BlO9RkbaYMhk/",
    pricePerNumber: 4.00,
    stats: { available: 180, paid: 120, total: 300 },
    status: "PAUSED" as const,
    scheduledDrawAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    skinRarity: "Extraordinary",
    skinRarityColor: "#e4ae39",
    skinWear: "Field-Tested",
    skinWeapon: "Specialist Gloves",
  },
];

type CategoryFilter = "ALL" | "Rifle" | "Knife" | "Gloves" | "Pistol" | "Sniper Rifle";

export default function RafflesPage() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  /* For now use mock data; later this will be replaced by useQuery */
  const filteredRaffles = useMemo(() => {
    let result = MOCK_RAFFLES;

    if (categoryFilter !== "ALL") {
      result = result.filter((r) => r.skinWeapon && getCategoryFromWeapon(r.skinWeapon) === categoryFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.title.toLowerCase().includes(q));
    }

    return result;
  }, [categoryFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRaffles.length / perPage));
  const paginatedRaffles = filteredRaffles.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Rifas de Skins CS2</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Explore todas as rifas de skins disponiveis. Armas, facas, luvas e muito mais.
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
      <RaffleGrid loading={false} emptyMessage="Nenhuma skin encontrada com os filtros selecionados.">
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
