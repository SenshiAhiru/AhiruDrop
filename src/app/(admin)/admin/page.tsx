"use client";

import { useState } from "react";
import {
  DollarSign,
  Ticket,
  Users,
  ShoppingCart,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";
import { StatsCard } from "@/components/admin/stats-card";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const recentOrders: {
  id: string;
  usuario: string;
  rifa: string;
  total: number;
  status: string;
  data: string;
}[] = [];

const recentActivity: { message: string; time: string }[] = [];

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
          value={formatCurrency(0)}
          icon={DollarSign}
          trend={{ value: 0, isPositive: true }}
          description="vs. mes anterior"
        />
        <StatsCard
          title="Rifas Ativas"
          value="0"
          icon={Ticket}
          trend={{ value: 0, isPositive: true }}
          description="novas esta semana"
        />
        <StatsCard
          title="Total Usuarios"
          value="0"
          icon={Users}
          trend={{ value: 0, isPositive: true }}
          description="vs. mes anterior"
        />
        <StatsCard
          title="Pedidos Pendentes"
          value="0"
          icon={ShoppingCart}
          trend={{ value: 0, isPositive: false }}
          description="aguardando pagamento"
        />
      </div>

      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Receita - Ultimos 30 dias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-72 flex-col items-center justify-center text-[var(--muted-foreground)]">
            <BarChart3 className="mb-2 h-10 w-10 opacity-40" />
            <p className="text-sm">Graficos disponiveis quando houver vendas</p>
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
              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-[var(--muted-foreground)]">
                  <ShoppingCart className="mb-2 h-10 w-10 opacity-40" />
                  <p className="text-sm">Nenhum pedido ainda</p>
                </div>
              ) : (
                <DataTable
                  columns={orderColumns}
                  data={recentOrders as unknown as OrderRow[]}
                  pagination={{
                    page,
                    pages: 1,
                    total: recentOrders.length,
                    onPageChange: setPage,
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-[var(--muted-foreground)]">
                <ArrowUpRight className="mb-2 h-8 w-8 opacity-40" />
                <p className="text-sm">Nenhuma atividade recente</p>
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
