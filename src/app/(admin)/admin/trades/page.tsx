"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRightLeft, Loader2, Search, Copy, CheckCircle, Send,
  Clock, AlertCircle, XCircle, Package, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/providers/confirm-provider";
import { usePoll } from "@/hooks/use-poll";
import { cn } from "@/lib/utils";

type Trade = {
  id: string;
  steamTradeUrl: string;
  steamTradeOfferId: string | null;
  status: "PENDING" | "SENT" | "COMPLETED" | "FAILED" | "CANCELLED";
  adminNotes: string | null;
  sentAt: string | null;
  completedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    steamId: string | null;
  };
  winner: {
    numberWon: number;
    draw: {
      raffle: {
        id: string;
        title: string;
        slug: string;
        skinImage: string | null;
        skinName: string | null;
        skinRarity: string | null;
        skinRarityColor: string | null;
      } | null;
    };
  };
};

const STATUS_TABS = ["ALL", "PENDING", "SENT", "COMPLETED", "FAILED", "CANCELLED"] as const;
const TAB_LABEL: Record<string, string> = {
  ALL: "Todos",
  PENDING: "Pendentes",
  SENT: "Enviados",
  COMPLETED: "Entregues",
  FAILED: "Falha",
  CANCELLED: "Cancelados",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  SENT: "Enviado",
  COMPLETED: "Entregue",
  FAILED: "Falhou",
  CANCELLED: "Cancelado",
};
const STATUS_VARIANT: Record<string, "warning" | "default" | "success" | "danger"> = {
  PENDING: "warning",
  SENT: "default",
  COMPLETED: "success",
  FAILED: "danger",
  CANCELLED: "danger",
};

export default function AdminTradesPage() {
  const { addToast } = useToast();
  const confirm = useConfirm();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [pendingCount, setPendingCount] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Send dialog
  const [sendOpen, setSendOpen] = useState(false);
  const [sendTradeId, setSendTradeId] = useState<string | null>(null);
  const [sendOfferId, setSendOfferId] = useState("");
  const [sendLoading, setSendLoading] = useState(false);

  // Verify
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "ALL") params.set("status", activeTab);
      const res = await fetch(`/api/admin/trades?${params}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setTrades(json.data.data);
        setPendingCount(json.data.pendingCount);
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(tradeId: string, status: string, label: string) {
    const ok = await confirm({
      title: `${label}?`,
      description: `Marcar este trade como "${STATUS_LABEL[status]}"? O usuário será notificado.`,
      confirmLabel: label,
      variant: status === "FAILED" || status === "CANCELLED" ? "destructive" : "default",
    });
    if (!ok) return;

    setUpdatingId(tradeId);
    try {
      const res = await fetch("/api/admin/trades", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeId, status }),
      });
      const json = await res.json();
      if (json.success) {
        addToast({ type: "success", message: `Trade marcado como ${STATUS_LABEL[status]}` });
        await load();
      } else {
        addToast({ type: "error", message: json.error || "Falha ao atualizar" });
      }
    } catch {
      addToast({ type: "error", message: "Erro de conexão" });
    } finally {
      setUpdatingId(null);
    }
  }

  function openSendDialog(tradeId: string) {
    setSendTradeId(tradeId);
    setSendOfferId("");
    setSendOpen(true);
  }

  async function submitSend() {
    if (!sendTradeId || !sendOfferId.trim()) {
      addToast({ type: "error", message: "Informe o Trade Offer ID" });
      return;
    }
    setSendLoading(true);
    try {
      const res = await fetch("/api/admin/trades", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tradeId: sendTradeId,
          status: "SENT",
          steamTradeOfferId: sendOfferId.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        addToast({ type: "success", message: "Trade marcado como enviado" });
        setSendOpen(false);
        await load();
      } else {
        addToast({ type: "error", message: json.error || "Falha" });
      }
    } catch {
      addToast({ type: "error", message: "Erro de conexão" });
    } finally {
      setSendLoading(false);
    }
  }

  async function verifySteam(tradeId: string) {
    setVerifyingId(tradeId);
    setVerifyResult(null);
    try {
      const res = await fetch("/api/admin/trades/verify-steam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeId }),
      });
      const json = await res.json();
      if (json.success) {
        setVerifyResult(json.data.steamStateLabel);
        if (json.data.autoCompleted) {
          addToast({ type: "success", message: "Trade confirmado automaticamente! Skin entregue." });
        } else {
          addToast({ type: "info", message: `Status Steam: ${json.data.steamStateLabel}` });
        }
        await load();
      } else {
        addToast({ type: "error", message: json.error || "Falha ao verificar" });
      }
    } catch {
      addToast({ type: "error", message: "Erro de conexão" });
    } finally {
      setVerifyingId(null);
    }
  }

  // Auto-verify SENT trades every 30s
  usePoll(async () => {
    const sentTrades = trades.filter(
      (t) => t.status === "SENT" && t.steamTradeOfferId
    );
    for (const t of sentTrades) {
      try {
        const res = await fetch("/api/admin/trades/verify-steam", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tradeId: t.id }),
        });
        const json = await res.json();
        if (json.success && json.data.autoCompleted) {
          addToast({ type: "success", message: `Trade da "${t.winner.draw.raffle?.title}" confirmado automaticamente!` });
          await load();
          break; // reload list, don't continue checking stale data
        }
      } catch {}
    }
  }, 30000);

  function copyTradeUrl(url: string) {
    navigator.clipboard.writeText(url);
    addToast({ type: "success", message: "Trade URL copiada" });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-6 w-6 text-accent-400" />
            <h1 className="text-2xl font-bold tracking-tight">Trades</h1>
            {pendingCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-xs font-bold text-amber-400">
                {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Gerencie as entregas de skins via Steam trade.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            {TAB_LABEL[tab]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : trades.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-10 w-10 mx-auto text-surface-600 mb-3" />
            <p className="text-surface-400">Nenhum trade {activeTab !== "ALL" ? TAB_LABEL[activeTab]?.toLowerCase() : ""}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {trades.map((t) => {
            const raffle = t.winner.draw.raffle;
            const isUpdating = updatingId === t.id;
            return (
              <div key={t.id} className="rounded-xl border border-surface-700 bg-surface-900/40 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Skin preview */}
                  <div className="flex items-center gap-3 lg:w-64 shrink-0">
                    {raffle?.skinImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={raffle.skinImage} alt={raffle.title} className="h-16 w-16 rounded-lg object-contain bg-surface-900 p-1" />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-surface-900 flex items-center justify-center">
                        <Package className="h-8 w-8 text-surface-600" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{raffle?.title ?? "—"}</p>
                      {raffle?.skinRarity && (
                        <span className="text-[10px] font-semibold" style={{ color: raffle.skinRarityColor || "#a1a1aa" }}>
                          {raffle.skinRarity}
                        </span>
                      )}
                      <p className="text-xs text-surface-500">Número #{t.winner.numberWon}</p>
                    </div>
                  </div>

                  {/* User + trade url */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      {t.user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.user.avatarUrl} alt="" className="h-8 w-8 rounded-full border border-surface-700" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-400">
                          {t.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link href={`/admin/users/${t.user.id}`} className="text-sm font-semibold text-white hover:text-primary-400 truncate block">
                          {t.user.name}
                        </Link>
                        <p className="text-xs text-surface-500">{t.user.email}</p>
                      </div>
                      <Badge variant={STATUS_VARIANT[t.status]} className="ml-auto shrink-0">
                        {STATUS_LABEL[t.status]}
                      </Badge>
                    </div>

                    {/* Trade URL with copy */}
                    <div className="flex items-center gap-2">
                      <code className="flex-1 truncate rounded bg-surface-800/60 px-2 py-1 text-xs text-surface-300 font-mono">
                        {t.steamTradeUrl}
                      </code>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => copyTradeUrl(t.steamTradeUrl)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <p className="text-[10px] text-surface-500">
                      Solicitado em {new Date(t.createdAt).toLocaleString("pt-BR")}
                      {t.user.steamId && ` · Steam ID: ${t.user.steamId}`}
                      {t.steamTradeOfferId && ` · Offer ID: ${t.steamTradeOfferId}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                    {t.status === "PENDING" && (
                      <>
                        <Button size="sm" disabled={isUpdating} onClick={() => openSendDialog(t.id)}>
                          <Send className="h-3.5 w-3.5" /> Marcar enviado
                        </Button>
                        <Button size="sm" variant="destructive" disabled={isUpdating} onClick={() => updateStatus(t.id, "CANCELLED", "Cancelar trade")}>
                          <XCircle className="h-3.5 w-3.5" /> Cancelar
                        </Button>
                      </>
                    )}
                    {t.status === "SENT" && (
                      <>
                        <Button
                          size="sm"
                          disabled={verifyingId === t.id || !t.steamTradeOfferId}
                          onClick={() => verifySteam(t.id)}
                        >
                          {verifyingId === t.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3.5 w-3.5" />
                          )}
                          Verificar Steam
                        </Button>
                        <Button size="sm" variant="accent" disabled={isUpdating} onClick={() => updateStatus(t.id, "COMPLETED", "Marcar como entregue")}>
                          <CheckCircle className="h-3.5 w-3.5" /> Entregue
                        </Button>
                        <Button size="sm" variant="destructive" disabled={isUpdating} onClick={() => updateStatus(t.id, "FAILED", "Marcar como falha")}>
                          <AlertCircle className="h-3.5 w-3.5" /> Falhou
                        </Button>
                      </>
                    )}
                    {(t.status === "FAILED" || t.status === "CANCELLED") && (
                      <Button size="sm" variant="outline" disabled={isUpdating} onClick={() => updateStatus(t.id, "PENDING", "Reabrir trade")}>
                        <Clock className="h-3.5 w-3.5" /> Reabrir
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Send Dialog — asks for Trade Offer ID */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogClose onClick={() => setSendOpen(false)} />
        <DialogHeader>
          <DialogTitle>Marcar trade como enviado</DialogTitle>
          <DialogDescription>
            Após enviar a trade offer no Steam, cole o <strong>Trade Offer ID</strong> abaixo.
            O sistema verificará automaticamente quando o usuário aceitar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs text-surface-400 mb-1 block">Trade Offer ID</label>
            <Input
              value={sendOfferId}
              onChange={(e) => setSendOfferId(e.target.value)}
              placeholder="Ex: 7193456789"
              type="text"
            />
            <p className="mt-1.5 text-xs text-surface-500">
              Encontre na URL da trade offer: steamcommunity.com/tradeoffer/<strong>7193456789</strong>/
            </p>
          </div>

          <div className="rounded-lg border border-surface-700 bg-surface-800/40 p-3 text-xs text-surface-400 space-y-1">
            <p className="font-semibold text-surface-300">O que acontece:</p>
            <p>1. O trade é marcado como &ldquo;Enviado&rdquo;</p>
            <p>2. O usuário recebe notificação para aceitar</p>
            <p>3. O sistema verifica automaticamente a cada 30s</p>
            <p>4. Quando aceito → marca &ldquo;Entregue&rdquo; sozinho</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setSendOpen(false)} disabled={sendLoading}>
            Cancelar
          </Button>
          <Button onClick={submitSend} disabled={sendLoading || !sendOfferId.trim()}>
            {sendLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Confirmar envio
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
