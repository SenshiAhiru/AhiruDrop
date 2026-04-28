"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  DollarSign, Ticket, Users, ShoppingCart, ArrowUpRight, BarChart3,
  Loader2, Trophy, Coins, Lock,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { StatsCard } from "@/components/admin/stats-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { usePoll } from "@/hooks/use-poll";

type DashboardData = {
  stats: {
    activeRaffles: number;
    totalUsers: number;
    pendingOrders: number;
    totalRevenue: number;
    usersThisWeek: number;
    rafflesClosed: number;
  };
  revenueByDay: { date: string; revenue: number; count: number }[];
  recentOrders: {
    id: string;
    status: string;
    finalAmount: number;
    createdAt: string;
    user: { name: string; email: string; avatarUrl: string | null };
    raffleTitle: string | null;
    raffleSlug: string | null;
  }[];
  recentDraws: {
    id: string;
    drawnAt: string;
    winningNumber: number;
    raffleTitle: string | null;
    raffleSlug: string | null;
    hasWinner: boolean;
  }[];
};

const STATUS_BADGE: Record<string, "success" | "warning" | "danger" | "default"> = {
  CONFIRMED: "success",
  PENDING: "warning",
  CANCELLED: "danger",
  EXPIRED: "default",
  REFUNDED: "default",
};

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Confirmado",
  PENDING: "Pendente",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
  REFUNDED: "Reembolsado",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      const json = await res.json();
      if (json.success) setData(json.data);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh every 30s
  usePoll(() => load({ silent: true }), 30000);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
        Falha ao carregar dashboard
      </div>
    );
  }

  const { stats, revenueByDay, recentOrders, recentDraws } = data;

  // Chart data formatted
  const chartData = revenueByDay.map((d) => ({
    date: new Date(d.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    revenue: d.revenue,
    count: d.count,
  }));

  const hasRevenue = revenueByDay.some((d) => d.revenue > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Visão geral da plataforma — atualiza a cada 30s
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Receita Total (AHC)"
          value={stats.totalRevenue.toFixed(2)}
          icon={Coins}
          description="em rifas confirmadas"
        />
        <StatsCard
          title="Rifas Ativas"
          value={String(stats.activeRaffles)}
          icon={Ticket}
          description={stats.rafflesClosed > 0 ? `${stats.rafflesClosed} aguardando sorteio` : "vendendo agora"}
        />
        <StatsCard
          title="Total Usuários"
          value={String(stats.totalUsers)}
          icon={Users}
          description={stats.usersThisWeek > 0 ? `+${stats.usersThisWeek} esta semana` : "sem novos esta semana"}
        />
        <StatsCard
          title="Pedidos Pendentes"
          value={String(stats.pendingOrders)}
          icon={ShoppingCart}
          description={stats.pendingOrders > 0 ? "aguardando ação" : "tudo em dia"}
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Receita dos últimos 30 dias</CardTitle>
        </CardHeader>
        <CardContent>
          {hasRevenue ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    style={{ fontSize: "10px" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="#71717a" style={{ fontSize: "10px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #3f3f46",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "#fafafa" }}
                    formatter={(value: any, name: any): [string, string] => [
                      String(name) === "revenue" ? `${Number(value).toFixed(2)} AHC` : `${value} pedido(s)`,
                      String(name) === "revenue" ? "Receita" : "Pedidos",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-72 flex-col items-center justify-center text-surface-500">
              <BarChart3 className="mb-2 h-10 w-10 opacity-40" />
              <p className="text-sm">Sem vendas nos últimos 30 dias</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pedidos Recentes</CardTitle>
                <Link href="/admin/orders" className="text-xs text-primary-400 hover:text-primary-300">
                  Ver todos →
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-surface-500">
                  <ShoppingCart className="mb-2 h-10 w-10 opacity-40" />
                  <p className="text-sm">Nenhum pedido ainda</p>
                </div>
              ) : (
                <div className="divide-y divide-surface-800">
                  {recentOrders.map((o) => (
                    <div key={o.id} className="flex items-center gap-3 p-4 hover:bg-surface-900/30 transition-colors">
                      {o.user.avatarUrl ? (
                        <Image
                          src={o.user.avatarUrl}
                          alt=""
                          width={32}
                          height={32}
                          className="rounded-full border border-surface-700"
                          unoptimized
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-400">
                          {o.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{o.user.name}</p>
                        <p className="text-xs text-surface-500 truncate">
                          {o.raffleTitle ?? "—"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-accent-400">
                          {o.finalAmount.toFixed(2)} AHC
                        </p>
                        <div className="flex items-center justify-end gap-1.5 mt-0.5">
                          <Badge variant={STATUS_BADGE[o.status] ?? "default"} className="text-[9px]">
                            {STATUS_LABEL[o.status] ?? o.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity (draws) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sorteios Recentes</CardTitle>
              <Link href="/winners" className="text-xs text-primary-400 hover:text-primary-300">
                Hall →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentDraws.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-surface-500">
                <Trophy className="mb-2 h-8 w-8 opacity-40" />
                <p className="text-sm">Nenhum sorteio ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDraws.map((d) => (
                  <Link
                    key={d.id}
                    href={d.raffleSlug ? `/raffles/${d.raffleSlug}/verify` : "#"}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface-900/50 transition-colors"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-500/10 text-accent-400">
                      <Trophy className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{d.raffleTitle ?? "—"}</p>
                      <p className="text-xs text-surface-500">
                        Número <span className="font-mono text-accent-400">#{d.winningNumber}</span>
                        {d.hasWinner && <span className="text-emerald-400"> · vencedor</span>}
                      </p>
                      <p className="text-[10px] text-surface-600 mt-0.5">
                        {formatDateTime(d.drawnAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/admin/raffles/new" className="flex items-center gap-3 rounded-xl border border-primary-500/30 bg-primary-500/5 p-4 hover:bg-primary-500/10 transition-colors">
          <Ticket className="h-6 w-6 text-primary-400" />
          <div>
            <p className="text-sm font-semibold">Nova rifa</p>
            <p className="text-xs text-surface-500">Criar e publicar</p>
          </div>
        </Link>
        {stats.rafflesClosed > 0 && (
          <Link href="/admin/raffles?status=CLOSED" className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 hover:bg-amber-500/10 transition-colors">
            <Lock className="h-6 w-6 text-amber-400" />
            <div>
              <p className="text-sm font-semibold">{stats.rafflesClosed} rifa(s) fechada(s)</p>
              <p className="text-xs text-surface-500">Aguardando sorteio</p>
            </div>
          </Link>
        )}
        <Link href="/admin/support" className="flex items-center gap-3 rounded-xl border border-surface-700 bg-surface-900/50 p-4 hover:bg-surface-900 transition-colors">
          <ArrowUpRight className="h-6 w-6 text-surface-400" />
          <div>
            <p className="text-sm font-semibold">Suporte</p>
            <p className="text-xs text-surface-500">Tickets e mensagens</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
