"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/data-table";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const mockPayments = [
  { id: "PAY-001", orderId: "ORD-001", gateway: "Mercado Pago", valor: 25.0, status: "APPROVED", method: "PIX", data: "2026-04-11T10:31:00" },
  { id: "PAY-002", orderId: "ORD-003", gateway: "Mercado Pago", valor: 50.0, status: "APPROVED", method: "PIX", data: "2026-04-11T08:22:00" },
  { id: "PAY-003", orderId: "ORD-005", gateway: "Stripe", valor: 30.0, status: "APPROVED", method: "Cartao", data: "2026-04-10T20:02:00" },
  { id: "PAY-004", orderId: "ORD-002", gateway: "Mercado Pago", valor: 15.0, status: "PENDING", method: "PIX", data: "2026-04-11T09:45:00" },
  { id: "PAY-005", orderId: "ORD-007", gateway: "PushinPay", valor: 35.0, status: "APPROVED", method: "PIX", data: "2026-04-10T16:17:00" },
  { id: "PAY-006", orderId: "ORD-006", gateway: "Mercado Pago", valor: 20.0, status: "EXPIRED", method: "PIX", data: "2026-04-10T18:30:00" },
  { id: "PAY-007", orderId: "ORD-009", gateway: "Mercado Pago", valor: 45.0, status: "APPROVED", method: "PIX", data: "2026-04-10T12:47:00" },
  { id: "PAY-008", orderId: "ORD-010", gateway: "PushinPay", valor: 10.0, status: "APPROVED", method: "PIX", data: "2026-04-10T10:32:00" },
  { id: "PAY-009", orderId: "ORD-004", gateway: "Mercado Pago", valor: 10.0, status: "REFUNDED", method: "PIX", data: "2026-04-10T22:15:00" },
  { id: "PAY-010", orderId: "ORD-008", gateway: "Stripe", valor: 5.0, status: "PENDING", method: "Cartao", data: "2026-04-10T14:01:00" },
];

const statusVariant: Record<string, "success" | "warning" | "danger" | "outline" | "default"> = {
  APPROVED: "success",
  PENDING: "warning",
  EXPIRED: "outline",
  REFUNDED: "danger",
  FAILED: "danger",
};

type PaymentRow = (typeof mockPayments)[number] & Record<string, unknown>;

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [gatewayFilter, setGatewayFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const filtered = mockPayments.filter((p) => {
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

      {/* Table */}
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
    </div>
  );
}
