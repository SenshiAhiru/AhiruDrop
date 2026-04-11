"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import type { CS2SkinSearchResult, SkinSelection } from "@/types/cs2.types";

interface SkinSearchInputProps {
  onSelect: (skin: SkinSelection) => void;
  selected: SkinSelection | null;
  onClear: () => void;
}

const FILTER_TABS = [
  { label: "Todos", value: "" },
  { label: "Rifles", value: "Rifle" },
  { label: "Pistolas", value: "Pistol" },
  { label: "Facas", value: "Knife" },
  { label: "Luvas", value: "Gloves" },
] as const;

export function SkinSearchInput({ onSelect, selected, onClear }: SkinSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CS2SkinSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState("");
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeFilter]);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query, limit: "30" });
      if (activeFilter) params.set("type", activeFilter);
      const res = await fetch(`/api/skins?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch skins");
      const data: CS2SkinSearchResult[] = await res.json();
      setResults(data);
      setShowDropdown(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, activeFilter]);

  // Fetch market price when skin is selected or wear changes
  useEffect(() => {
    if (!selected) {
      setMarketPrice(null);
      return;
    }

    const fetchPrice = async () => {
      setPriceLoading(true);
      try {
        const params = new URLSearchParams({
          name: selected.skinName,
          wear: selected.skinWear,
          stattrak: String(selected.skinStatTrak),
        });
        const res = await fetch(`/api/skins/price?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch price");
        const data = await res.json();
        setMarketPrice(data.price ?? null);
      } catch {
        setMarketPrice(null);
      } finally {
        setPriceLoading(false);
      }
    };

    fetchPrice();
  }, [selected?.skinName, selected?.skinWear, selected?.skinStatTrak, selected]);

  function handleSelect(skin: CS2SkinSearchResult) {
    const selection: SkinSelection = {
      skinName: skin.name,
      skinImage: skin.image,
      skinWeapon: skin.weapon,
      skinCategory: skin.category,
      skinRarity: skin.rarity,
      skinRarityColor: skin.rarityColor,
      skinWear: "",
      skinFloat: null,
      skinStatTrak: false,
      skinSouvenir: false,
      skinExteriorMin: skin.minFloat,
      skinExteriorMax: skin.maxFloat,
      skinMarketPrice: null,
    };
    onSelect(selection);
    setShowDropdown(false);
    setQuery("");
  }

  // ---------- Selected Preview ----------
  if (selected) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        {/* Image */}
        <div className="relative flex items-center justify-center h-[200px] bg-gradient-to-b from-surface-900 to-surface-800 rounded-t-xl">
          <Image
            src={selected.skinImage}
            alt={selected.skinName}
            width={280}
            height={180}
            className="object-contain max-h-[180px] drop-shadow-2xl"
          />
        </div>

        {/* Info */}
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <h3 className="text-xl font-bold truncate">{selected.skinName}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center rounded-md bg-surface-800/60 px-2 py-0.5 text-xs font-medium text-[var(--muted-foreground)]">
                  {selected.skinWeapon}
                </span>
                <span className="inline-flex items-center rounded-md bg-surface-800/60 px-2 py-0.5 text-xs font-medium text-[var(--muted-foreground)]">
                  {selected.skinCategory}
                </span>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: selected.skinRarityColor }}
                >
                  {selected.skinRarity}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClear}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:bg-surface-800/50 hover:text-[var(--foreground)]"
            >
              <X className="h-3.5 w-3.5" />
              Trocar skin
            </button>
          </div>

          {/* Float range */}
          <p className="text-sm text-[var(--muted-foreground)]">
            Float:{" "}
            <span className="font-mono font-medium text-[var(--foreground)]">
              {selected.skinExteriorMin.toFixed(2)} - {selected.skinExteriorMax.toFixed(2)}
            </span>
          </p>

          {/* Market price */}
          <div className="text-sm">
            {priceLoading ? (
              <span className="text-[var(--muted-foreground)] animate-pulse">
                Consultando...
              </span>
            ) : marketPrice != null ? (
              <span className="font-bold text-accent-500">
                Valor de mercado: {formatCurrency(marketPrice)}
              </span>
            ) : (
              <span className="text-[var(--muted-foreground)]">
                Valor de mercado:{" "}
                <span className="italic">Indisponivel</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Search ----------
  return (
    <div ref={containerRef} className="relative">
      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveFilter(tab.value)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              activeFilter === tab.value
                ? "bg-primary-600 text-white"
                : "bg-surface-800/50 text-[var(--muted-foreground)] hover:bg-surface-700/50 hover:text-[var(--foreground)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder='Buscar skin... ex: AK-47 Asiimov'
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] py-2.5 pl-9 pr-4 text-sm placeholder:text-[var(--muted-foreground)] transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
        )}
      </div>

      {/* Dropdown results */}
      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-80 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xl shadow-black/20">
          {results.map((skin) => (
            <button
              key={skin.id}
              type="button"
              onClick={() => handleSelect(skin)}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-800/50"
            >
              {/* Skin image */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-800">
                <Image
                  src={skin.image}
                  alt={skin.name}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>

              {/* Name + category */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{skin.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{skin.category}</p>
              </div>

              {/* Rarity badge */}
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: skin.rarityColor }}
              >
                {skin.rarity}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {showDropdown && !loading && results.length === 0 && query.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-xl shadow-black/20">
          <p className="text-sm text-[var(--muted-foreground)]">
            Nenhuma skin encontrada
          </p>
        </div>
      )}
    </div>
  );
}
