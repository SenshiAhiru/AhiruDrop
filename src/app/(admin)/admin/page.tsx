"use client";

import { useState } from "react";
import {
  DollarSign,
  Ticket,
  Users,
  ShoppingCart,
  ArrowUpRight,
} from "lucide-react";
import { StatsCard } from "@/components/admin/stats-card";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- Mock Data ---
const revenueData = Array.from({ length: 30 }, (_, i) => ({
  date: `${String(i + 1).padStart(2, "0")}/04`,
  revenue: Math.floor(Math.random() * 5000) + 1000,
}));

const recentOrders = [
  { id: "ORD-001", usuario: "Maria Silva", rifa: "iPhone 15 Pro", total: 25.0, status: "PAID", data: "2026-04-11T10:30:00" },
  { id: "ORD-002", usuario: "Joao Santos", rifa: "PS5 Slim", total: 15.0, status: "PENDING", data: "2026-04-11T09:45:00" },
  { id: "ORD-003", usuario: "Ana Costa", rifa: "MacBook Air M3", total: 50.0, status: "PAID", data: "2026-04-11T08:20:00" },
  { id: "ORD-004", usuario: "Pedro Lima", rifa: "iPhone 15 Pro", total: 10.0, status: "CANCELLED", data: "2026-04-10T22:10:00" },
  { id: "ORD-005", usuario: "Julia Rocha", rifa: "PS5 Slim", total: 30.0, status: "PAID", data: "2026-04-10T20:00:00" },
  { id: "ORD-006", usuario: "Lucas Alves", rifa: "MacBook Air M3", total: 20.0, status: "EXPIRED", data: "2026-04-10T18:30:00" },
  { id: "ORD-007", usuario: "Carla Souza", rifa: "Smart TV 65\"", total: 35.0, status: "PAID", data: "2026-04-10T16:15:00" },
  { id: "ORD-008", usuario: "Rafael Dias", rifa: "iPhone 15 Pro", total: 5.0, status: "PENDING", data: "2026-04-10T14:00:00" },
  { id: "ORD-009", usuario: "Fernanda Reis", rifa: "PS5 Slim", total: 45.0, status: "PAID", data: "2026-04-10T12:45:00" },
  { id: "ORD-010", usuario: "Bruno Melo", rifa: "Smart TV 65\"", total: 10.0, status: "PAID", data: "2026-04-10T10:30:00" },
];

const recentActivity = [
  { message: "Nova rifa criada: Smart TV 65\"", time: "2 min atras" },
  { message: "Pedido ORD-001 pago via Mercado Pago", time: "15 min atras" },
  { message: "Usuario 'Carlos' se cadastrou", time: "30 min atras" },
  { message: "Rifa 'iPhone 15 Pro' atingiu 80% vendida", time: "1h atras" },
  { message: "Sorteio realizado: Rifa 'Galaxy S24'", time: "3h atras" },
];

const statusBadge: Record<string, "success" | "warning" | "danger" | "outline"> = {
  PAID: "success",
  PENDING: "warning",
  CANCELLED: "danger",
  EXPIRED: "outline",
};

type OrderRow = (typeof recentOrders)[number] & Record<string, unknown>;

const orderColumns: Column<OrderRow>[] = [
  { key: "id", label: "ID" },
  { key: "usuario", label: "Usuario" },
  { key: "rifa", label: "Rifa" },
  {
    key: "total",
    label: "Total",
    render: (item) => formatCurrency(item.total as number),
  },
  {
    key: "status",
    label: "Status",
    render: (item) => (
      <Badge variant={statusBadge[item.status as string] ?? "outline"}>
        {item.status as string}
      </Badge>
    ),
  },
  {
    key: "data",
    label: "Data",
    render: (item) => formatDateTime(item.data as string),
  },
];

export default function AdminDashboardPage() {
  const [page, setPage] = useState(1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Arrecadado"
          value={formatCurrency(48750)}
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
          description="vs. mes anterior"
        />
        <StatsCard
          title="Rifas Ativas"
          value="8"
          icon={Ticket}
          trend={{ value: 3, isPositive: true }}
          description="novas esta semana"
        />
        <StatsCard
          title="Total Usuarios"
          value="1.247"
          icon={Users}
          trend={{ value: 8.2, isPositive: true }}
          description="vs. mes anterior"
        />
        <StatsCard
          title="Pedidos Pendentes"
          value="23"
          icon={ShoppingCart}
          trend={{ value: 5, isPositive: false }}
          description="aguardando pagamento"
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Receita - Ultimos 30 dias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `R$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                  formatter={(v: number) => [formatCurrency(v), "Receita"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Recentes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                columns={orderColumns}
                data={recentOrders as unknown as OrderRow[]}
                pagination={{
                  page,
                  pages: 3,
                  total: 30,
                  onPageChange: setPage,
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600/10">
                    <ArrowUpRight className="h-3 w-3 text-primary-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{activity.message}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
