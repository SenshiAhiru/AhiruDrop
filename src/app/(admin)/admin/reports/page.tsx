"use client";

import { useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Target,
  CalendarDays,
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

const revenueData = [
  { date: "05/04", receita: 5200 },
  { date: "06/04", receita: 7800 },
  { date: "07/04", receita: 6100 },
  { date: "08/04", receita: 9400 },
  { date: "09/04", receita: 4300 },
  { date: "10/04", receita: 8700 },
  { date: "11/04", receita: 3730 },
];

interface TopRaffle {
  id: string;
  rifa: string;
  vendas: number;
  receita: number;
}

const topRaffles: TopRaffle[] = [
  {
    id: "r1",
    rifa: "iPhone 15 Pro Max 256GB",
    vendas: 780,
    receita: 19500,
  },
  {
    id: "r2",
    rifa: "PS5 Slim + 2 Controles",
    vendas: 450,
    receita: 13500,
  },
  {
    id: "r4",
    rifa: 'Smart TV Samsung 65" 4K',
    vendas: 320,
    receita: 6400,
  },
  {
    id: "r5",
    rifa: "Galaxy S24 Ultra",
    vendas: 120,
    receita: 4800,
  },
];

type TopRaffleRow = TopRaffle & Record<string, unknown>;

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState("2026-04-05");
  const [dateTo, setDateTo] = useState("2026-04-11");

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
          value="R$ 45.230,00"
          icon={DollarSign}
          trend={{ value: 12, isPositive: true }}
          description="vs. periodo anterior"
        />
        <StatsCard
          title="Total Pedidos"
          value="234"
          icon={ShoppingCart}
          trend={{ value: 8, isPositive: true }}
          description="vs. periodo anterior"
        />
        <StatsCard
          title="Ticket Medio"
          value="R$ 193,29"
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
          description="vs. periodo anterior"
        />
        <StatsCard
          title="Taxa de Conversao"
          value="68%"
          icon={Target}
          trend={{ value: 2, isPositive: false }}
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
          </div>
        </CardContent>
      </Card>

      {/* Top Raffles */}
      <Card>
        <CardHeader>
          <CardTitle>Top Rifas por Receita</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={topRaffleColumns}
            data={topRaffles as unknown as TopRaffleRow[]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
