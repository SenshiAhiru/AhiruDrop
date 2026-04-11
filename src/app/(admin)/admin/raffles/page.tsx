"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/data-table";
import { formatCurrency, formatDate } from "@/lib/utils";

// --- Mock Data ---
const mockRaffles = [
  { id: "r1", title: "iPhone 15 Pro Max 256GB", status: "ACTIVE", price: 5.0, soldNumbers: 780, totalNumbers: 1000, createdAt: "2026-04-01" },
  { id: "r2", title: "PS5 Slim + 2 Controles", status: "ACTIVE", price: 3.0, soldNumbers: 450, totalNumbers: 500, createdAt: "2026-04-03" },
  { id: "r3", title: "MacBook Air M3 15\"", status: "DRAFT", price: 10.0, soldNumbers: 0, totalNumbers: 2000, createdAt: "2026-04-08" },
  { id: "r4", title: "Smart TV Samsung 65\" 4K", status: "CLOSED", price: 2.0, soldNumbers: 1000, totalNumbers: 1000, createdAt: "2026-03-15" },
  { id: "r5", title: "Galaxy S24 Ultra", status: "CANCELLED", price: 4.0, soldNumbers: 120, totalNumbers: 800, createdAt: "2026-03-20" },
];

const statusVariant: Record<string, "success" | "warning" | "danger" | "outline" | "default"> = {
  ACTIVE: "success",
  DRAFT: "outline",
  PAUSED: "warning",
  CLOSED: "default",
  CANCELLED: "danger",
};

const statusLabel: Record<string, string> = {
  ACTIVE: "Ativa",
  DRAFT: "Rascunho",
  PAUSED: "Pausada",
  CLOSED: "Encerrada",
  CANCELLED: "Cancelada",
};

type RaffleRow = (typeof mockRaffles)[number] & Record<string, unknown>;

export default function AdminRafflesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const filtered = mockRaffles.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const columns: Column<RaffleRow>[] = [
    { key: "title", label: "Titulo" },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <Badge variant={statusVariant[item.status as string] ?? "outline"}>
          {statusLabel[item.status as string] ?? item.status}
        </Badge>
      ),
    },
    {
      key: "price",
      label: "Preco",
      render: (item) => formatCurrency(item.price as number),
    },
    {
      key: "numbers",
      label: "Numeros",
      render: (item) => (
        <span>
          <span className="font-semibold">{item.soldNumbers as number}</span>
          <span className="text-[var(--muted-foreground)]">/{item.totalNumbers as number}</span>
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Criada em",
      render: (item) => formatDate(item.createdAt as string),
    },
    {
      key: "actions",
      label: "Acoes",
      render: (item) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/raffles/${item.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/admin/raffles/${item.id}/numbers`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Rifas</h1>
        <Link href="/admin/raffles/new">
          <Button>
            <Plus className="h-4 w-4" />
            Nova Rifa
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Buscar rifas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-44"
        >
          <option value="ALL">Todos os status</option>
          <option value="ACTIVE">Ativa</option>
          <option value="DRAFT">Rascunho</option>
          <option value="PAUSED">Pausada</option>
          <option value="CLOSED">Encerrada</option>
          <option value="CANCELLED">Cancelada</option>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered as unknown as RaffleRow[]}
        pagination={{
          page,
          pages: 1,
          total: filtered.length,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
