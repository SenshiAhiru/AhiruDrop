"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Ticket,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, type Column } from "@/components/admin/data-table";
import { formatCurrency, formatDate } from "@/lib/utils";

interface RaffleItem {
  id: string;
  title: string;
  status: string;
  pricePerNumber: number;
  totalNumbers: number;
  skinImage?: string;
  skinWear?: string;
  skinRarity?: string;
  skinRarityColor?: string;
  createdAt: string;
  stats?: { available: number; reserved: number; paid: number; total: number };
}

const statusVariant: Record<string, "success" | "warning" | "danger" | "outline" | "default" | "accent"> = {
  ACTIVE: "success",
  DRAFT: "outline",
  PAUSED: "warning",
  CLOSED: "default",
  DRAWN: "accent",
  CANCELLED: "danger",
};

const statusLabel: Record<string, string> = {
  ACTIVE: "Ativa",
  DRAFT: "Rascunho",
  PAUSED: "Pausada",
  CLOSED: "Encerrada",
  DRAWN: "Sorteada",
  CANCELLED: "Cancelada",
};

type RaffleRow = RaffleItem & Record<string, unknown>;

export default function AdminRafflesPage() {
  const [raffles, setRaffles] = useState<RaffleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const fetchRaffles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/raffles?${params}`);
      const json = await res.json();
      if (json.success && json.data?.data) {
        setRaffles(json.data.data);
      } else {
        setRaffles([]);
      }
    } catch {
      setRaffles([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchRaffles();
  }, [fetchRaffles]);

  const columns: Column<RaffleRow>[] = [
    {
      key: "title",
      label: "Titulo",
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.skinImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.skinImage as string}
              alt=""
              className="h-10 w-10 rounded-lg bg-surface-800 object-contain"
            />
          )}
          <span className="font-medium">{item.title as string}</span>
        </div>
      ),
    },
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
      key: "pricePerNumber",
      label: "Preco",
      render: (item) => formatCurrency(Number(item.pricePerNumber)),
    },
    {
      key: "numbers",
      label: "Numeros",
      render: (item) => {
        const stats = item.stats as RaffleItem["stats"];
        const sold = stats ? stats.paid + stats.reserved : 0;
        const total = (item.totalNumbers as number) || 0;
        return (
          <span>
            <span className="font-semibold">{sold}</span>
            <span className="text-[var(--muted-foreground)]">/{total}</span>
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Criada em",
      render: (item) => formatDate(item.createdAt as string),
    },
    {
      key: "actions",
      label: "",
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
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchRaffles}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link href="/admin/raffles/new">
            <Button>
              <Plus className="h-4 w-4" />
              Nova Rifa
            </Button>
          </Link>
        </div>
      </div>

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
          <option value="DRAWN">Sorteada</option>
          <option value="CANCELLED">Cancelada</option>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : raffles.length === 0 ? (
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
          data={raffles as unknown as RaffleRow[]}
          pagination={{
            page,
            pages: Math.max(1, Math.ceil(raffles.length / 20)),
            total: raffles.length,
            onPageChange: setPage,
          }}
        />
      )}
    </div>
  );
}
