"use client";

import { useState } from "react";
import {
  Search,
  ShoppingCart,
} from "lucide-react";
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

const orders: {
  id: string;
  usuario: string;
  rifa: string;
  qtd: number;
  total: number;
  status: string;
  pagamento: string;
  data: string;
}[] = [];

const statusVariant: Record<string, "success" | "warning" | "danger" | "outline"> = {
  PAID: "success",
  PENDING: "warning",
  CANCELLED: "danger",
  EXPIRED: "outline",
};

type OrderRow = (typeof orders)[number] & Record<string, unknown>;

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("TODOS");
  const [page, setPage] = useState(1);

  const filtered = orders.filter((o) => {
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
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
      </div>

      {/* Table or Empty State */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--border)] py-16 text-[var(--muted-foreground)]">
          <ShoppingCart className="mb-3 h-12 w-12 opacity-40" />
          <p className="text-lg font-medium">Nenhum pedido encontrado</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
