"use client";

import { useState } from "react";
import { Search, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/data-table";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const payments: {
  id: string;
  orderId: string;
  gateway: string;
  valor: number;
  status: string;
  method: string;
  data: string;
}[] = [];

const statusVariant: Record<string, "success" | "warning" | "danger" | "outline" | "default"> = {
  APPROVED: "success",
  PENDING: "warning",
  EXPIRED: "outline",
  REFUNDED: "danger",
  FAILED: "danger",
};

type PaymentRow = (typeof payments)[number] & Record<string, unknown>;

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [gatewayFilter, setGatewayFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const filtered = payments.filter((p) => {
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    if (gatewayFilter !== "ALL" && p.gateway !== gatewayFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.id.toLowerCase().includes(q) || p.orderId.toLowerCase().includes(q);
    }
    return true;
  });

  const columns: Column<PaymentRow>[] = [
    { key: "id", label: "ID" },
    { key: "orderId", label: "Pedido" },
    { key: "gateway", label: "Gateway" },
    {
      key: "valor",
      label: "Valor",
      render: (item) => formatCurrency(item.valor as number),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <Badge variant={statusVariant[item.status as string] ?? "outline"}>
          {item.status as string}
        </Badge>
      ),
    },
    { key: "method", label: "Metodo" },
    {
      key: "data",
      label: "Data",
      render: (item) => formatDateTime(item.data as string),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Pagamentos</h1>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Buscar por ID ou pedido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-40"
        >
          <option value="ALL">Todos status</option>
          <option value="APPROVED">Aprovado</option>
          <option value="PENDING">Pendente</option>
          <option value="EXPIRED">Expirado</option>
          <option value="REFUNDED">Reembolsado</option>
          <option value="FAILED">Falhou</option>
        </Select>
        <Select
          value={gatewayFilter}
          onChange={(e) => setGatewayFilter(e.target.value)}
          className="w-full sm:w-44"
        >
          <option value="ALL">Todos gateways</option>
          <option value="Mercado Pago">Mercado Pago</option>
          <option value="Stripe">Stripe</option>
          <option value="PushinPay">PushinPay</option>
        </Select>
        <Input type="date" className="w-full sm:w-40" />
        <Input type="date" className="w-full sm:w-40" />
      </div>

      {/* Table or Empty State */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--border)] py-16 text-[var(--muted-foreground)]">
          <DollarSign className="mb-3 h-12 w-12 opacity-40" />
          <p className="text-lg font-medium">Nenhum pagamento encontrado</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered as unknown as PaymentRow[]}
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
