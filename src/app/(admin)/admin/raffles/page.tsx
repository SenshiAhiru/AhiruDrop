"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Ticket,
  RefreshCw,
  Trash2,
  Trophy,
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
  const { addToast } = useToast();
  const [raffles, setRaffles] = useState<RaffleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; title: string; deleting: boolean }>({
    open: false, id: "", title: "", deleting: false,
  });

  const handleDelete = async () => {
    setDeleteModal((prev) => ({ ...prev, deleting: true }));
    try {
      const res = await fetch(`/api/admin/raffles/${deleteModal.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setDeleteModal({ open: false, id: "", title: "", deleting: false });
        addToast({ type: "success", message: "Rifa excluída" });
        fetchRaffles();
      } else {
        addToast({ type: "error", message: json.error || "Erro ao excluir" });
      }
    } catch {
      addToast({ type: "error", message: "Erro de conexão ao excluir rifa" });
    } finally {
      setDeleteModal((prev) => ({ ...prev, deleting: false }));
    }
  };

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
            <Image
              src={item.skinImage as string}
              alt=""
              width={40}
              height={40}
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
      label: "Preço",
      render: (item) => `${Number(item.pricePerNumber)} AHC`,
    },
    {
      key: "numbers",
      label: "Números",
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
          {item.status === "CLOSED" && (
            <Link href={`/admin/raffles/${item.id}/draw`} title="Realizar sorteio">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10">
                <Trophy className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Link href={`/admin/raffles/${item.id}`} title="Editar">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/admin/raffles/${item.id}/numbers`} title="Ver números">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={() => setDeleteModal({ open: true, id: item.id as string, title: item.title as string, deleting: false })}
            title="Excluir"
          >
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
      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !deleteModal.deleting && setDeleteModal({ open: false, id: "", title: "", deleting: false })} />
          <div className="relative w-full max-w-md rounded-2xl border border-surface-700 bg-surface-900 p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                <Trash2 className="h-7 w-7 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Excluir rifa</h3>
              <p className="text-sm text-surface-400 mb-1">Tem certeza que deseja excluir?</p>
              <p className="text-sm font-semibold text-white mb-6">&quot;{deleteModal.title}&quot;</p>
              <p className="text-xs text-surface-500 mb-6">Esta ação não pode ser desfeita. Todos os números e dados serão removidos.</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteModal({ open: false, id: "", title: "", deleting: false })}
                  disabled={deleteModal.deleting}
                  className="flex-1 rounded-lg border border-surface-700 px-4 py-2.5 text-sm font-medium text-surface-400 hover:text-white hover:bg-surface-800 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteModal.deleting}
                  className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleteModal.deleting ? "Excluindo..." : "Sim, excluir"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
