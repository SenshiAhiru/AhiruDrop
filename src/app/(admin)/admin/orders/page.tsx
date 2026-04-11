"use client";

import { useState } from "react";
import {
  Search,
  Download,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/data-table";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const statusTabs = ["TODOS", "PENDING", "PAID", "CANCELLED", "EXPIRED"];
const statusLabels: Record<string, string> = {
  TODOS: "Todos",
  PENDING: "Pendente",
  PAID: "Pago",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
};

const mockOrders = [
  { id: "ORD-001", usuario: "Maria Silva", rifa: "iPhone 15 Pro", qtd: 5, total: 25.0, status: "PAID", pagamento: "PIX", data: "2026-04-11T10:30:00" },
  { id: "ORD-002", usuario: "Joao Santos", rifa: "PS5 Slim", qtd: 5, total: 15.0, status: "PENDING", pagamento: "-", data: "2026-04-11T09:45:00" },
  { id: "ORD-003", usuario: "Ana Costa", rifa: "MacBook Air M3", qtd: 5, total: 50.0, status: "PAID", pagamento: "PIX", data: "2026-04-11T08:20:00" },
  { id: "ORD-004", usuario: "Pedro Lima", rifa: "iPhone 15 Pro", qtd: 2, total: 10.0, status: "CANCELLED", pagamento: "-", data: "2026-04-10T22:10:00" },
  { id: "ORD-005", usuario: "Julia Rocha", rifa: "PS5 Slim", qtd: 10, total: 30.0, status: "PAID", pagamento: "Cartao", data: "2026-04-10T20:00:00" },
  { id: "ORD-006", usuario: "Lucas Alves", rifa: "MacBook Air M3", qtd: 2, total: 20.0, status: "EXPIRED", pagamento: "-", data: "2026-04-10T18:30:00" },
  { id: "ORD-007", usuario: "Carla Souza", rifa: "Smart TV 65\"", qtd: 7, total: 35.0, status: "PAID", pagamento: "PIX", data: "2026-04-10T16:15:00" },
  { id: "ORD-008", usuario: "Rafael Dias", rifa: "iPhone 15 Pro", qtd: 1, total: 5.0, status: "PENDING", pagamento: "-", data: "2026-04-10T14:00:00" },
  { id: "ORD-009", usuario: "Fernanda Reis", rifa: "PS5 Slim", qtd: 15, total: 45.0, status: "PAID", pagamento: "PIX", data: "2026-04-10T12:45:00" },
  { id: "ORD-010", usuario: "Bruno Melo", rifa: "Smart TV 65\"", qtd: 5, total: 10.0, status: "PAID", pagamento: "PIX", data: "2026-04-10T10:30:00" },
];

const statusVariant: Record<string, "success" | "warning" | "danger" | "outline"> = {
  PAID: "success",
  PENDING: "warning",
  CANCELLED: "danger",
  EXPIRED: "outline",
};

type OrderRow = (typeof mockOrders)[number] & Record<string, unknown>;

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("TODOS");
  const [page, setPage] = useState(1);
  const [actionsOpen, setActionsOpen] = useState<string | null>(null);

  const filtered = mockOrders.filter((o) => {
    if (activeTab !== "TODOS" && o.status !== activeTab) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.usuario.toLowerCase().includes(q) ||
        o.rifa.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const columns: Column<OrderRow>[] = [
    { key: "id", label: "ID" },
    { key: "usuario", label: "Usuario" },
    { key: "rifa", label: "Rifa" },
    { key: "qtd", label: "Qtd" },
    {
      key: "total",
      label: "Total",
      render: (item) => formatCurrency(item.total as number),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <Badge variant={statusVariant[item.status as string] ?? "outline"}>
          {statusLabels[item.status as string] ?? item.status}
        </Badge>
      ),
    },
    { key: "pagamento", label: "Pagamento" },
    {
      key: "data",
      label: "Data",
      render: (item) => formatDateTime(item.data as string),
    },
    {
      key: "actions",
      label: "Acoes",
      render: (item) => (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              setActionsOpen(actionsOpen === (item.id as string) ? null : (item.id as string))
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {actionsOpen === (item.id as string) && (
            <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-[var(--border)] bg-[var(--card)] py-1 shadow-xl">
              <button className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--muted)]/50">
                <Eye className="h-4 w-4" /> Ver detalhes
              </button>
              {(item.status as string) === "PENDING" && (
                <button className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--muted)]/50">
                  <CheckCircle className="h-4 w-4" /> Aprovar manual
                </button>
              )}
              {(item.status as string) !== "CANCELLED" && (
                <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-[var(--muted)]/50">
                  <XCircle className="h-4 w-4" /> Cancelar
                </button>
              )}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
        <Button variant="outline">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-1">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={cn(
              "whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            {statusLabels[tab] ?? tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Buscar por ID, usuario ou rifa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Input type="date" className="w-full sm:w-40" />
        <Input type="date" className="w-full sm:w-40" />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered as unknown as OrderRow[]}
        pagination={{
          page,
          pages: Math.max(1, Math.ceil(filtered.length / 10)),
          total: filtered.length,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
