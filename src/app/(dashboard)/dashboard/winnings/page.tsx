"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Trophy, Shield, Loader2, CheckCircle, Clock, ExternalLink,
  ArrowRightLeft, Send, AlertCircle, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n/provider";

type TradeInfo = {
  id: string;
  status: "PENDING" | "SENT" | "COMPLETED" | "FAILED" | "CANCELLED";
};

type WinningItem = {
  id: string;
  numberWon: number;
  claimedAt: string | null;
  createdAt: string;
  drawnAt: string;
  tradeRequest?: TradeInfo | null;
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

const TRADE_STATUS_LABEL: Record<string, string> = {
  PENDING: "Trade solicitado",
  SENT: "Trade enviado — aceite no Steam",
  COMPLETED: "Skin entregue",
  FAILED: "Trade falhou",
  CANCELLED: "Trade cancelado",
};

const TRADE_STATUS_VARIANT: Record<string, "warning" | "default" | "success" | "danger"> = {
  PENDING: "warning",
  SENT: "default",
  COMPLETED: "success",
  FAILED: "danger",
  CANCELLED: "danger",
};

const TRADE_URL_REGEX = /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=\d+&token=[\w-]+$/;

export default function WinningsPage() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [items, setItems] = useState<WinningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedTradeUrl, setSavedTradeUrl] = useState("");

  // Trade dialog
  const [tradeOpen, setTradeOpen] = useState(false);
  const [tradeWinnerId, setTradeWinnerId] = useState<string | null>(null);
  const [tradeUrl, setTradeUrl] = useState("");
  const [tradeSending, setTradeSending] = useState(false);
  const [tradeError, setTradeError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [wRes, pRes] = await Promise.all([
        fetch("/api/user/winnings", { cache: "no-store" }),
        fetch("/api/user/profile", { cache: "no-store" }).catch(() => null),
      ]);
      const wJson = await wRes.json();
      if (wJson.success) setItems(wJson.data.data);

      if (pRes?.ok) {
        const pJson = await pRes.json();
        if (pJson.success && pJson.data?.steamTradeUrl) {
          setSavedTradeUrl(pJson.data.steamTradeUrl);
        }
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openTradeDialog(winnerId: string) {
    setTradeWinnerId(winnerId);
    setTradeUrl(savedTradeUrl);
    setTradeError(null);
    setTradeOpen(true);
  }

  async function submitTrade() {
    if (!tradeWinnerId) return;
    setTradeError(null);

    if (!TRADE_URL_REGEX.test(tradeUrl.trim())) {
      setTradeError("Trade URL inválida. Exemplo: https://steamcommunity.com/tradeoffer/new/?partner=123&token=abc");
      return;
    }

    setTradeSending(true);
    try {
      const res = await fetch("/api/user/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId: tradeWinnerId, steamTradeUrl: tradeUrl.trim() }),
      });
      const json = await res.json();
      if (!json.success) {
        setTradeError(json.error || "Falha ao solicitar");
        return;
      }
      addToast({ type: "success", message: "Trade solicitado!", description: "O admin será notificado." });
      setTradeOpen(false);
      setSavedTradeUrl(tradeUrl.trim());
      await load();
    } catch {
      setTradeError("Erro de conexão");
    } finally {
      setTradeSending(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Trophy className="h-6 w-6 text-accent-400" />
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{t("myWins.title")}</h1>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">
          {t("myWins.subtitle")}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">{error}</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-surface-700 bg-surface-900/50 p-10 text-center">
          <Trophy className="h-10 w-10 mx-auto text-surface-600 mb-3" />
          <p className="text-surface-400 mb-1">{t("myWins.empty")}</p>
          <p className="text-xs text-surface-500 mb-4">Boa sorte na próxima!</p>
          <Link href="/raffles" className="inline-block rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
            Ver rifas ativas
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            if (!item.raffle) return null;
            const r = item.raffle;
            const trade = item.tradeRequest;
            const canRequestTrade = !item.claimedAt && !trade;
            const tradeLabel = trade ? TRADE_STATUS_LABEL[trade.status] : null;
            const tradeVariant = trade ? TRADE_STATUS_VARIANT[trade.status] : null;

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
                      <img src={r.skinImage} alt={r.title} className="h-full w-full object-contain p-4" />
                    ) : (
                      <Trophy className="h-16 w-16 text-surface-700" />
                    )}
                    <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-accent-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      <Trophy className="h-3 w-3" /> {t("myWins.youWon")}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 p-5 space-y-3">
                    <div>
                      {r.skinWeapon && (
                        <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">{r.skinWeapon}</p>
                      )}
                      <h3 className="text-lg font-bold text-white">{r.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {r.skinRarity && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded border" style={{
                            color: r.skinRarityColor || "#a1a1aa",
                            borderColor: `${r.skinRarityColor || "#a1a1aa"}40`,
                            backgroundColor: `${r.skinRarityColor || "#a1a1aa"}10`,
                          }}>
                            {r.skinRarity}
                          </span>
                        )}
                        {r.skinWear && <span className="text-[11px] text-surface-400">{r.skinWear}</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg border border-surface-700 bg-surface-800/60 p-3">
                        <p className="text-[10px] text-surface-500 uppercase">{t("myWins.winningNumber")}</p>
                        <p className="text-xl font-mono font-bold text-accent-400">#{item.numberWon}</p>
                      </div>
                      <div className="rounded-lg border border-surface-700 bg-surface-800/60 p-3">
                        <p className="text-[10px] text-surface-500 uppercase">{t("myWins.drawnAt")}</p>
                        <p className="text-sm font-semibold text-white">
                          {new Date(item.drawnAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>

                    {/* Trade / Claim Status */}
                    {item.claimedAt ? (
                      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-sm text-emerald-400">
                        <CheckCircle className="h-4 w-4" />
                        <span>Skin entregue em {new Date(item.claimedAt).toLocaleDateString("pt-BR")}</span>
                      </div>
                    ) : trade ? (
                      <div className="flex items-center gap-2 rounded-lg border p-2.5 text-sm" style={{
                        borderColor: trade.status === "SENT" ? "rgb(59 130 246 / 0.3)" : undefined,
                        backgroundColor: trade.status === "SENT" ? "rgb(59 130 246 / 0.1)" : undefined,
                      }}>
                        {trade.status === "PENDING" && <Clock className="h-4 w-4 text-amber-400" />}
                        {trade.status === "SENT" && <Send className="h-4 w-4 text-blue-400" />}
                        {trade.status === "COMPLETED" && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                        {trade.status === "FAILED" && <AlertCircle className="h-4 w-4 text-red-400" />}
                        {trade.status === "CANCELLED" && <AlertCircle className="h-4 w-4 text-red-400" />}
                        <span>{tradeLabel}</span>
                        <Badge variant={tradeVariant!} className="ml-auto text-[10px]">
                          {trade.status}
                        </Badge>
                      </div>
                    ) : (
                      <Button
                        variant="accent"
                        className="w-full"
                        onClick={() => openTradeDialog(item.id)}
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                        Solicitar trade da skin
                      </Button>
                    )}

                    <div className="flex gap-2 pt-1">
                      <Link href={`/raffles/${r.slug}`} className="flex-1 text-center rounded-lg border border-surface-700 bg-surface-800/60 px-3 py-2 text-xs font-semibold text-surface-300 hover:bg-surface-800">
                        {t("myWins.viewRaffle")}
                      </Link>
                      <Link href={`/raffles/${r.slug}/verify`} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20">
                        <Shield className="h-3.5 w-3.5" />
                        {t("myWins.viewProof")}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trade Request Dialog */}
      <Dialog open={tradeOpen} onOpenChange={setTradeOpen}>
        <DialogClose onClick={() => setTradeOpen(false)} />
        <DialogHeader>
          <DialogTitle>Solicitar trade da skin</DialogTitle>
          <DialogDescription>
            Cole sua Steam Trade URL abaixo. O admin enviará a trade offer pra você aceitar no Steam.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs text-surface-400 mb-1 block">Steam Trade URL</label>
            <Input
              value={tradeUrl}
              onChange={(e) => setTradeUrl(e.target.value)}
              placeholder="https://steamcommunity.com/tradeoffer/new/?partner=...&token=..."
            />
            <a
              href="https://steamcommunity.com/my/tradeoffers/privacy#trade_offer_access_url"
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300"
            >
              Onde encontro minha Trade URL?
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="rounded-lg border border-surface-700 bg-surface-800/40 p-3 text-xs text-surface-400 space-y-1">
            <p className="font-semibold text-surface-300">Como funciona:</p>
            <p>1. Cole sua Trade URL acima</p>
            <p>2. O admin será notificado e enviará a trade offer</p>
            <p>3. Aceite a trade no app Steam (Steam Guard)</p>
            <p>4. A skin será transferida para sua conta</p>
          </div>

          {tradeError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-sm text-red-400 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {tradeError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setTradeOpen(false)} disabled={tradeSending}>
            Cancelar
          </Button>
          <Button onClick={submitTrade} disabled={tradeSending} variant="accent">
            {tradeSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRightLeft className="h-4 w-4" />}
            Solicitar trade
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
