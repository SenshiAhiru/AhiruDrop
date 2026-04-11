"use client";

import { useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Target,
  CalendarDays,
  BarChart3,
  Ticket,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatsCard } from "@/components/admin/stats-card";
import { DataTable, type Column } from "@/components/admin/data-table";
import { formatCurrency } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const revenueData: { date: string; receita: number }[] = [];

interface TopRaffle {
  id: string;
  rifa: string;
  vendas: number;
  receita: number;
}

const topRaffles: TopRaffle[] = [];

type TopRaffleRow = TopRaffle & Record<string, unknown>;

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const topRaffleColumns: Column<TopRaffleRow>[] = [
    {
      key: "rifa",
      label: "Rifa",
      render: (item) => (
        <span className="font-medium">{item.rifa as string}</span>
      ),
    },
    { key: "vendas", label: "Vendas" },
    {
      key: "receita",
      label: "Receita",
      render: (item) => (
        <span className="font-semibold text-emerald-500">
          {formatCurrency(item.receita as number)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Relatorios</h1>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
          />
          <span className="text-[var(--muted-foreground)]">ate</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Receita Total"
          value="R$ 0,00"
          icon={DollarSign}
          trend={{ value: 0, isPositive: true }}
          description="vs. periodo anterior"
        />
        <StatsCard
          title="Total Pedidos"
          value="0"
          icon={ShoppingCart}
          trend={{ value: 0, isPositive: true }}
          description="vs. periodo anterior"
        />
        <StatsCard
          title="Ticket Medio"
          value="R$ 0,00"
          icon={TrendingUp}
          trend={{ value: 0, isPositive: true }}
          description="vs. periodo anterior"
        />
        <StatsCard
          title="Taxa de Conversao"
          value="0%"
          icon={Target}
          trend={{ value: 0, isPositive: false }}
          description="vs. periodo anterior"
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Receita por Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            {revenueData.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-[var(--muted-foreground)]">
                <BarChart3 className="mb-2 h-10 w-10 opacity-40" />
                <p className="text-sm">Sem dados para o periodo selecionado</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="colorReceita"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#7c3aed"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#7c3aed"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      `R$ ${(v / 1000).toFixed(0)}k`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Receita",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    fill="url(#colorReceita)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Raffles */}
      <Card>
        <CardHeader>
          <CardTitle>Top Rifas por Receita</CardTitle>
        </CardHeader>
        <CardContent>
          {topRaffles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[var(--muted-foreground)]">
              <Ticket className="mb-2 h-10 w-10 opacity-40" />
              <p className="text-sm">Nenhuma rifa no periodo</p>
            </div>
          ) : (
            <DataTable
              columns={topRaffleColumns}
              data={topRaffles as unknown as TopRaffleRow[]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
