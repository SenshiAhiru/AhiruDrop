"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Shield, Loader2, ExternalLink } from "lucide-react";
import { useTranslation } from "@/i18n/provider";

type WinnerItem = {
  id: string;
  title: string;
  slug: string;
  skinImage: string | null;
  skinRarity: string | null;
  skinRarityColor: string | null;
  skinWear: string | null;
  skinWeapon: string | null;
  skinMarketPrice: number | null;
  totalNumbers: number;
  pricePerNumber: number;
  drawnAt: string;
  winningNumber: number | null;
  winner: {
    name: string;
    avatarUrl: string | null;
  } | null;
};

export default function WinnersPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<WinnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/winners", { cache: "no-store" });
        const json = await res.json();
        if (!json.success) {
          setError(json.error || "Falha ao carregar");
          return;
        }
        setItems(json.data.data);
      } catch {
        setError("Erro de conexão");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/10">
            <Trophy className="h-6 w-6 text-accent-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{t("winners.title")}</h1>
            <p className="text-sm text-surface-400">
              {t("winners.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-xl border border-surface-700 bg-surface-900/50 p-10 text-center">
          <Trophy className="h-10 w-10 mx-auto text-surface-600 mb-3" />
          <p className="text-surface-400">{t("winners.empty")}</p>
          <Link
            href="/raffles"
            className="inline-block mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            Ver rifas ativas
          </Link>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/raffles/${item.slug}`}
              className="group rounded-2xl border border-surface-700 bg-surface-900/50 overflow-hidden hover:border-accent-500/40 hover:shadow-lg hover:shadow-accent-500/10 transition-all"
            >
              {/* Image */}
              <div className="relative aspect-square bg-gradient-to-br from-surface-800 to-surface-900 flex items-center justify-center overflow-hidden">
                {item.skinImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.skinImage}
                    alt={item.title}
                    className="h-full w-full object-contain p-6 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <Trophy className="h-20 w-20 text-surface-700" />
                )}
                <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-accent-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  <Trophy className="h-3 w-3" />
                  Sorteada
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                <div>
                  {item.skinWeapon && (
                    <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">
                      {item.skinWeapon}
                    </p>
                  )}
                  <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    {item.skinRarity && (
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded border"
                        style={{
                          color: item.skinRarityColor || "#a1a1aa",
                          borderColor: `${item.skinRarityColor || "#a1a1aa"}40`,
                          backgroundColor: `${item.skinRarityColor || "#a1a1aa"}10`,
                        }}
                      >
                        {item.skinRarity}
                      </span>
                    )}
                    {item.skinWear && (
                      <span className="text-[10px] text-surface-400">{item.skinWear}</span>
                    )}
                  </div>
                </div>

                {/* Winner */}
                {item.winner && (
                  <div className="flex items-center gap-2 rounded-lg border border-surface-700 bg-surface-800/60 p-2">
                    {item.winner.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.winner.avatarUrl}
                        alt={item.winner.name}
                        className="h-8 w-8 rounded-full border border-accent-500/40"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-accent-500/20 border border-accent-500/40 flex items-center justify-center text-xs font-bold text-accent-400">
                        {item.winner.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-surface-500">Ganhador</p>
                      <p className="text-xs font-semibold text-white truncate">
                        {item.winner.name}
                      </p>
                    </div>
                    {item.winningNumber !== null && (
                      <div className="text-right">
                        <p className="text-[10px] text-surface-500">Número</p>
                        <p className="text-xs font-mono font-bold text-accent-400">
                          #{item.winningNumber}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Date + verify link */}
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-surface-500">
                    {new Date(item.drawnAt).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <Shield className="h-3 w-3" />
                    Verificar
                    <ExternalLink className="h-2.5 w-2.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
