"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  DollarSign, ShoppingCart, TrendingUp, Users, CalendarDays,
  BarChart3, Ticket, Loader2, Download,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/admin/stats-card";
import { useToast } from "@/components/ui/toast";

type SummaryData = {
  period: { from: string; to: string };
  stats: {
    revenue: number;
    totalOrders: number;
    confirmedOrders: number;
    newUsers: number;
    newRaffles: number;
    avgTicket: number;
  };
  revenueByDay: { date: string; revenue: number; count: number }[];
  topRaffles: {
    raffleId: string;
    title: string;
    slug: string | null;
    skinImage: string | null;
    skinRarityColor: string | null;
    totalNumbers: number;
    soldNumbers: number;
    totalRevenue: number;
    totalOrders: number;
  }[];
};

function defaultFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
}

function defaultTo(): string {
  return new Date().toISOString().split("T")[0];
}

export default function ReportsPage() {
  const { addToast } = useToast();
  const [dateFrom, setDateFrom] = useState(defaultFrom());
  const [dateTo, setDateTo] = useState(defaultTo());
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!dateFrom || !dateTo) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ from: dateFrom, to: dateTo, type: "summary" });
      const res = await fetch(`/api/admin/reports?${params}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) setData(json.data);
      else addToast({ type: "error", message: json.error || "Falha ao carregar" });
    } catch {
      addToast({ type: "error", message: "Erro de conexão" });
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, addToast]);

  useEffect(() => {
    load();
  }, [load]);

  const chartData = useMemo(
    () =>
      (data?.revenueByDay ?? []).map((d) => ({
        date: new Date(d.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        revenue: d.revenue,
        count: d.count,
      })),
    [data]
  );

  const hasRevenue = (data?.revenueByDay ?? []).some((d) => d.revenue > 0);

  function exportCSV() {
    if (!data) return;
    const headers = ["data", "receita_ahc", "pedidos"];
    const rows = data.revenueByDay.map((d) => [d.date, d.revenue.toFixed(2), String(d.count)]);
    const csv =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${dateFrom}_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {dateFrom && dateTo && `${new Date(dateFrom).toLocaleDateString("pt-BR")} até ${new Date(dateTo).toLocaleDateString("pt-BR")}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CalendarDays className="h-4 w-4 text-[var(--muted-foreground)]" />
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
          <span className="text-[var(--muted-foreground)]">até</span>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={!data || loading}>
            <Download className="h-4 w-4" /> CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : !data ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          Falha ao carregar dados
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Receita (AHC)"
              value={data.stats.revenue.toFixed(2)}
              icon={DollarSign}
              description={`${data.stats.confirmedOrders} pedido(s) confirmado(s)`}
            />
            <StatsCard
              title="Total Pedidos"
              value={String(data.stats.totalOrders)}
              icon={ShoppingCart}
              description="criados no período"
            />
            <StatsCard
              title="Ticket Médio"
              value={`${data.stats.avgTicket.toFixed(2)} AHC`}
              icon={TrendingUp}
              description="por pedido confirmado"
            />
            <StatsCard
              title="Novos Usuários"
              value={String(data.stats.newUsers)}
              icon={Users}
              description={`${data.stats.newRaffles} rifa(s) criadas`}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Receita por dia</CardTitle>
            </CardHeader>
            <CardContent>
              {hasRevenue ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="rev2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: "10px" }} interval="preserveStartEnd" />
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
                      <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fill="url(#rev2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-72 flex-col items-center justify-center text-surface-500">
                  <BarChart3 className="mb-2 h-10 w-10 opacity-40" />
                  <p className="text-sm">Sem receita no período selecionado</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Rifas por Receita</CardTitle>
            </CardHeader>
            <CardContent>
              {data.topRaffles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-surface-500">
                  <Ticket className="mb-2 h-10 w-10 opacity-40" />
                  <p className="text-sm">Nenhuma venda no período</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.topRaffles.map((r, i) => {
                    const pct = r.totalNumbers > 0 ? (r.soldNumbers / r.totalNumbers) * 100 : 0;
                    return (
                      <Link
                        key={r.raffleId}
                        href={r.slug ? `/admin/raffles/${r.raffleId}` : "#"}
                        className="flex items-center gap-3 p-3 rounded-lg border border-surface-700 bg-surface-900/40 hover:bg-surface-900 transition-colors"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-500/10 text-accent-400 text-sm font-bold shrink-0">
                          {i + 1}
                        </div>
                        {r.skinImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.skinImage} alt={r.title} className="h-12 w-12 object-contain rounded bg-surface-900 p-1 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{r.title}</p>
                          <p className="text-xs text-surface-500">
                            {r.soldNumbers}/{r.totalNumbers} vendidos · {r.totalOrders} pedido(s)
                          </p>
                          <div className="mt-1 h-1 rounded-full bg-surface-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-accent-400">
                            {r.totalRevenue.toFixed(2)} AHC
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
