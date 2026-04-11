"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/data-table";
import { formatCurrency, formatDate } from "@/lib/utils";

const raffles: {
  id: string;
  title: string;
  status: string;
  price: number;
  soldNumbers: number;
  totalNumbers: number;
  createdAt: string;
}[] = [];

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

type RaffleRow = (typeof raffles)[number] & Record<string, unknown>;

export default function AdminRafflesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const filtered = raffles.filter((r) => {
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

      {/* Table or Empty State */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--border)] py-16 text-[var(--muted-foreground)]">
          <Ticket className="mb-3 h-12 w-12 opacity-40" />
          <p className="text-lg font-medium">Nenhuma rifa criada</p>
          <p className="mt-1 text-sm">Crie sua primeira rifa de skin CS2!</p>
          <Link href="/admin/raffles/new" className="mt-4">
            <Button>
              <Plus className="h-4 w-4" />
              Nova Rifa
            </Button>
          </Link>
        </div>
      ) : (
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
      )}
    </div>
  );
}
