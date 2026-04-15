"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Shield, Loader2, CheckCircle, Clock, ExternalLink } from "lucide-react";

type WinningItem = {
  id: string;
  numberWon: number;
  claimedAt: string | null;
  createdAt: string;
  drawnAt: string;
  raffle: {
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
  } | null;
};

export default function WinningsPage() {
  const [items, setItems] = useState<WinningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user/winnings", { cache: "no-store" });
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
    <div className="max-w-4xl space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Trophy className="h-6 w-6 text-accent-400" />
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Minhas Vitórias</h1>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">
          Rifas que você ganhou. Clique em uma para ver a prova do sorteio.
        </p>
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
          <p className="text-surface-400 mb-1">Você ainda não ganhou nenhuma rifa.</p>
          <p className="text-xs text-surface-500 mb-4">Boa sorte na próxima! 🍀</p>
          <Link
            href="/raffles"
            className="inline-block rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            Ver rifas ativas
          </Link>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => {
            if (!item.raffle) return null;
            const r = item.raffle;
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-accent-500/30 bg-gradient-to-br from-accent-500/10 via-surface-900/50 to-surface-900/50 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="relative sm:w-48 aspect-square sm:aspect-auto bg-surface-900 flex items-center justify-center shrink-0">
                    {r.skinImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.skinImage}
                        alt={r.title}
                        className="h-full w-full object-contain p-4"
                      />
                    ) : (
                      <Trophy className="h-16 w-16 text-surface-700" />
                    )}
                    <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-accent-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      <Trophy className="h-3 w-3" />
                      Você ganhou!
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 p-5 space-y-3">
                    <div>
                      {r.skinWeapon && (
                        <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">
                          {r.skinWeapon}
                        </p>
                      )}
                      <h3 className="text-lg font-bold text-white">{r.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {r.skinRarity && (
                          <span
                            className="text-[11px] font-semibold px-2 py-0.5 rounded border"
                            style={{
                              color: r.skinRarityColor || "#a1a1aa",
                              borderColor: `${r.skinRarityColor || "#a1a1aa"}40`,
                              backgroundColor: `${r.skinRarityColor || "#a1a1aa"}10`,
                            }}
                          >
                            {r.skinRarity}
                          </span>
                        )}
                        {r.skinWear && (
                          <span className="text-[11px] text-surface-400">{r.skinWear}</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg border border-surface-700 bg-surface-800/60 p-3">
                        <p className="text-[10px] text-surface-500 uppercase">Número sorteado</p>
                        <p className="text-xl font-mono font-bold text-accent-400">
                          #{item.numberWon}
                        </p>
                      </div>
                      <div className="rounded-lg border border-surface-700 bg-surface-800/60 p-3">
                        <p className="text-[10px] text-surface-500 uppercase">Sorteado em</p>
                        <p className="text-sm font-semibold text-white">
                          {new Date(item.drawnAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div
                      className={`flex items-center gap-2 rounded-lg border p-2.5 text-sm ${
                        item.claimedAt
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {item.claimedAt ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>
                            Prêmio resgatado em{" "}
                            {new Date(item.claimedAt).toLocaleDateString("pt-BR")}
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4" />
                          <span>Aguardando resgate — entre em contato com o suporte</span>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Link
                        href={`/raffles/${r.slug}`}
                        className="flex-1 text-center rounded-lg border border-surface-700 bg-surface-800/60 px-3 py-2 text-xs font-semibold text-surface-300 hover:bg-surface-800"
                      >
                        Ver rifa
                      </Link>
                      <Link
                        href={`/raffles/${r.slug}/verify`}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        Prova do sorteio
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
