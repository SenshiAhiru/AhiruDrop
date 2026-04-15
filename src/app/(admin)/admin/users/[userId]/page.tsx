"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Trophy,
  ShoppingCart,
  Shield,
  Ban,
  CheckCircle2,
  Loader2,
  Plus,
  Minus,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

type Detail = {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    cpf: string | null;
    steamId: string | null;
    role: "USER" | "ADMIN";
    avatarUrl: string | null;
    balance: number;
    isActive: boolean;
    emailVerified: string | null;
    createdAt: string;
    updatedAt: string;
  };
  stats: {
    orderCount: number;
    winCount: number;
    notificationCount: number;
    confirmedSpent: number;
    confirmedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
  };
  orders: {
    id: string;
    status: string;
    totalAmount: number;
    finalAmount: number;
    discount: number;
    createdAt: string;
    items: {
      id: string;
      quantity: number;
      pricePerNumber: number;
      subtotal: number;
      raffle: { id: string; title: string; slug: string; skinImage: string | null } | null;
    }[];
  }[];
  winnings: {
    id: string;
    numberWon: number;
    claimedAt: string | null;
    createdAt: string;
    drawnAt: string;
    raffle: { id: string; title: string; slug: string; skinImage: string | null } | null;
  }[];
};

const statusVariant: Record<string, "success" | "warning" | "danger" | "outline" | "default"> = {
  CONFIRMED: "success",
  PENDING: "warning",
  CANCELLED: "danger",
  EXPIRED: "default",
  REFUNDED: "outline",
};

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.userId as string;

  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<"credit" | "debit">("credit");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { cache: "no-store" });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Falha ao carregar");
        return;
      }
      setDetail(json.data);
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function submitAdjustment() {
    setAdjustError(null);
    const raw = parseFloat(adjustAmount.replace(",", "."));
    if (!isFinite(raw) || raw <= 0) {
      setAdjustError("Informe um valor positivo");
      return;
    }
    if (adjustReason.trim().length < 3) {
      setAdjustError("Motivo deve ter pelo menos 3 caracteres");
      return;
    }

    const signedAmount = adjustType === "credit" ? raw : -raw;
    setAdjusting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: signedAmount, reason: adjustReason.trim() }),
      });
      const json = await res.json();
      if (!json.success) {
        setAdjustError(json.error || "Falha ao ajustar");
        return;
      }
      setAdjustOpen(false);
      setAdjustAmount("");
      setAdjustReason("");
      await load();
    } catch {
      setAdjustError("Erro de conexão");
    } finally {
      setAdjusting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {error || "Usuário não encontrado"}
        </div>
      </div>
    );
  }

  const { user, stats, orders, winnings } = detail;

  return (
    <div className="space-y-6 max-w-5xl">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para usuários
      </Link>

      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-20 w-20 rounded-full border-2 border-surface-700"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-primary-500/20 border-2 border-primary-500/30 flex items-center justify-center text-2xl font-bold text-primary-400">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
                <Badge variant={user.role === "ADMIN" ? "accent" : "default"}>{user.role}</Badge>
                <Badge variant={user.isActive ? "success" : "danger"}>
                  {user.isActive ? "Ativo" : "Bloqueado"}
                </Badge>
              </div>
              <div className="mt-2 space-y-1 text-sm text-surface-400">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {user.email}
                  {user.emailVerified ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <span className="text-xs text-amber-400">(não verificado)</span>
                  )}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> {user.phone}
                  </div>
                )}
                {user.steamId && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Steam ID: {user.steamId}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Cadastrado em {formatDate(user.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-surface-400 uppercase">Saldo atual</p>
            <div className="flex items-center gap-2 mt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ahc-coin.png" alt="" className="h-6 w-6 rounded-full" />
              <p className="text-2xl font-bold text-accent-400">{user.balance.toFixed(2)}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 w-full"
              onClick={() => {
                setAdjustType("credit");
                setAdjustOpen(true);
              }}
            >
              Ajustar saldo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-surface-400 uppercase">Pedidos</p>
            <p className="text-2xl font-bold mt-1">{stats.confirmedOrders}</p>
            <p className="text-xs text-surface-500 mt-1">
              {stats.pendingOrders} pendentes · {stats.cancelledOrders} cancelados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-surface-400 uppercase">Gasto total</p>
            <p className="text-2xl font-bold text-surface-200 mt-1">
              {stats.confirmedSpent.toFixed(2)}
            </p>
            <p className="text-xs text-surface-500 mt-1">AHC em rifas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-surface-400 uppercase">Vitórias</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Trophy className="h-5 w-5 text-accent-400" />
              <p className="text-2xl font-bold text-accent-400">{stats.winCount}</p>
            </div>
            <p className="text-xs text-surface-500 mt-1">rifas ganhadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Winnings */}
      {winnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent-400" />
              Rifas ganhadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {winnings.map((w) => (
              <div
                key={w.id}
                className="flex items-center gap-3 rounded-lg border border-surface-700 bg-surface-800/40 p-3"
              >
                {w.raffle?.skinImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={w.raffle.skinImage}
                    alt={w.raffle.title}
                    className="h-14 w-14 object-contain rounded-lg bg-surface-900"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-lg bg-surface-900 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-surface-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{w.raffle?.title ?? "—"}</p>
                  <p className="text-xs text-surface-500">
                    Número #{w.numberWon} · sorteada em {formatDate(w.drawnAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={w.claimedAt ? "success" : "warning"}>
                    {w.claimedAt ? "Resgatada" : "Pendente"}
                  </Badge>
                  {w.raffle && (
                    <Link
                      href={`/raffles/${w.raffle.slug}/verify`}
                      className="text-xs text-emerald-400 hover:text-emerald-300"
                    >
                      Ver prova
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary-400" />
            Pedidos ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-surface-400 text-center py-6">
              Nenhum pedido ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="rounded-lg border border-surface-700 bg-surface-800/40 p-3"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-surface-500">#{o.id.slice(-8)}</span>
                      <Badge variant={statusVariant[o.status] || "default"}>{o.status}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-accent-400">
                        {o.finalAmount.toFixed(2)} AHC
                      </p>
                      <p className="text-xs text-surface-500">
                        {formatDate(o.createdAt)}
                      </p>
                    </div>
                  </div>
                  {o.items.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-surface-700/50 space-y-1">
                      {o.items.map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center justify-between text-xs text-surface-400"
                        >
                          <span className="truncate">
                            {it.quantity}x {it.raffle?.title ?? "—"}
                          </span>
                          <span className="font-mono">
                            {it.pricePerNumber.toFixed(2)} AHC/cota
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Balance Adjustment Dialog */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogClose onClick={() => setAdjustOpen(false)} />
        <DialogHeader>
          <DialogTitle>Ajustar saldo</DialogTitle>
          <DialogDescription>
            Saldo atual: <strong className="text-accent-400">{user.balance.toFixed(2)} AHC</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAdjustType("credit")}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                adjustType === "credit"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-surface-700 text-surface-400 hover:text-white"
              }`}
            >
              <Plus className="h-4 w-4" /> Creditar
            </button>
            <button
              type="button"
              onClick={() => setAdjustType("debit")}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                adjustType === "debit"
                  ? "border-red-500/40 bg-red-500/10 text-red-400"
                  : "border-surface-700 text-surface-400 hover:text-white"
              }`}
            >
              <Minus className="h-4 w-4" /> Debitar
            </button>
          </div>

          <div>
            <label className="text-xs text-surface-400 mb-1 block">Valor (AHC)</label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="text-xs text-surface-400 mb-1 block">Motivo (obrigatório)</label>
            <Textarea
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="Ex: bônus de boas-vindas, ajuste de pedido cancelado, etc."
              rows={3}
            />
          </div>

          {adjustError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-sm text-red-400 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {adjustError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setAdjustOpen(false)} disabled={adjusting}>
            Cancelar
          </Button>
          <Button
            variant={adjustType === "credit" ? "default" : "destructive"}
            onClick={submitAdjustment}
            disabled={adjusting}
          >
            {adjusting && <Loader2 className="h-4 w-4 animate-spin" />}
            {adjustType === "credit" ? "Creditar" : "Debitar"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
