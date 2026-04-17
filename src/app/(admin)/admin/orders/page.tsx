"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search, ShoppingCart, Download, Loader2, CheckSquare, Square, X, XCircle, Clock,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/providers/confirm-provider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/admin/data-table";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const statusTabs = ["TODOS", "CONFIRMED", "PENDING", "CANCELLED", "EXPIRED", "REFUNDED"];
const statusLabels: Record<string, string> = {
  TODOS: "Todos",
  CONFIRMED: "Confirmado",
  PENDING: "Pendente",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
  REFUNDED: "Reembolsado",
};

const statusVariant: Record<string, "success" | "warning" | "danger" | "outline" | "default"> = {
  CONFIRMED: "success",
  PENDING: "warning",
  CANCELLED: "danger",
  EXPIRED: "default",
  REFUNDED: "outline",
};

type AdminOrder = {
  id: string;
  status: string;
  totalAmount: string | number;
  finalAmount: string | number;
  createdAt: string;
  user?: { id: string; name: string; email: string };
  items?: {
    id: string;
    quantity: number;
    raffle?: { id: string; title: string } | null;
  }[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("TODOS");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulking, setBulking] = useState(false);
  const { addToast } = useToast();
  const confirm = useConfirm();

  const buildParams = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (activeTab !== "TODOS") params.set("status", activeTab);
    return params;
  }, [search, activeTab]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = buildParams();
      params.set("page", String(page));
      params.set("limit", "50");
      const res = await fetch(`/api/admin/orders?${params}`, { cache: "no-store" });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Falha ao carregar");
        return;
      }
      setOrders(json.data.data);
      setPages(json.data.pages || 1);
      setTotal(json.data.total || 0);
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }, [buildParams, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, search, activeTab]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === orders.length && orders.length > 0) {
      setSelectedIds(new Set());
    } else {
      // Only select cancellable orders (PENDING)
      setSelectedIds(
        new Set(orders.filter((o) => o.status === "PENDING").map((o) => o.id))
      );
    }
  }

  async function runBulkAction(action: "cancel" | "expire", label: string) {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const ok = await confirm({
      title: `${label} ${ids.length} pedido${ids.length > 1 ? "s" : ""}?`,
      description:
        "Números reservados serão liberados. Pedidos não-PENDING serão ignorados.",
      confirmLabel: label,
      variant: "destructive",
    });
    if (!ok) return;

    setBulking(true);
    try {
      const res = await fetch("/api/admin/orders/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: ids, action }),
      });
      const json = await res.json();
      if (json.success) {
        addToast({
          type: "success",
          message: `${json.data.affected} pedido${json.data.affected !== 1 ? "s" : ""} atualizado${json.data.affected !== 1 ? "s" : ""}${
            json.data.errors.length > 0 ? ` (${json.data.errors.length} falhas)` : ""
          }`,
        });
        setSelectedIds(new Set());
        await load();
      } else {
        addToast({ type: "error", message: json.error || "Falha na ação" });
      }
    } catch {
      addToast({ type: "error", message: "Erro de conexão" });
    } finally {
      setBulking(false);
    }
  }

  async function downloadCSV() {
    setExporting(true);
    try {
      const params = buildParams();
      const res = await fetch(`/api/admin/orders/export?${params}`, { cache: "no-store" });
      if (!res.ok) {
        addToast({ type: "error", message: "Falha ao exportar" });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pedidos-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast({ type: "success", message: "CSV baixado" });
    } catch {
      addToast({ type: "error", message: "Erro de conexão" });
    } finally {
      setExporting(false);
    }
  }

  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const allPendingSelected =
    pendingOrders.length > 0 && pendingOrders.every((o) => selectedIds.has(o.id));

  const columns: Column<AdminOrder & Record<string, unknown>>[] = [
    {
      key: "select",
      label: (
        <button
          onClick={toggleSelectAll}
          className="flex items-center justify-center text-surface-400 hover:text-white"
          title={allPendingSelected ? "Desmarcar" : "Marcar pendentes"}
          disabled={pendingOrders.length === 0}
        >
          {allPendingSelected ? (
            <CheckSquare className="h-4 w-4 text-primary-400" />
          ) : selectedIds.size > 0 ? (
            <CheckSquare className="h-4 w-4 text-primary-400/50" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </button>
      ),
      render: (item) => {
        const canSelect = (item.status as string) === "PENDING";
        if (!canSelect) {
          return <span className="text-surface-800">—</span>;
        }
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSelect(item.id as string);
            }}
            className="flex items-center justify-center text-surface-400 hover:text-white"
          >
            {selectedIds.has(item.id as string) ? (
              <CheckSquare className="h-4 w-4 text-primary-400" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </button>
        );
      },
    },
    {
      key: "id",
      label: "ID",
      render: (item) => (
        <span className="font-mono text-xs text-surface-400">
          #{(item.id as string).slice(-8)}
        </span>
      ),
    },
    {
      key: "user",
      label: "Usuário",
      render: (item) => {
        const user = item.user as AdminOrder["user"];
        if (!user) return <span className="text-xs text-surface-500">—</span>;
        return (
          <Link href={`/admin/users/${user.id}`} className="block hover:opacity-80">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-surface-500 truncate">{user.email}</p>
          </Link>
        );
      },
    },
    {
      key: "items",
      label: "Rifas",
      render: (item) => {
        const items = item.items as AdminOrder["items"];
        if (!items || items.length === 0) return <span className="text-xs text-surface-500">—</span>;
        const first = items[0];
        return (
          <div className="text-xs">
            <p className="truncate max-w-[240px]">
              {first.quantity}x {first.raffle?.title ?? "—"}
            </p>
            {items.length > 1 && (
              <p className="text-surface-500">+{items.length - 1} outras</p>
            )}
          </div>
        );
      },
    },
    {
      key: "finalAmount",
      label: "Total",
      render: (item) => (
        <span className="font-mono text-sm font-semibold text-accent-400">
          {Number(item.finalAmount).toFixed(2)} AHC
        </span>
      ),
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
    {
      key: "createdAt",
      label: "Data",
      render: (item) => (
        <span className="text-xs text-surface-400">
          {formatDateTime(item.createdAt as string)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {total} pedido{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="outline" onClick={downloadCSV} disabled={exporting || total === 0}>
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Exportar CSV
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
            placeholder="Buscar por ID, nome ou email do usuário..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="sticky top-4 z-20 flex items-center justify-between gap-3 rounded-xl border border-primary-500/40 bg-primary-500/10 backdrop-blur-sm px-4 py-2.5 shadow-lg shadow-primary-500/10">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-semibold text-primary-300">
              {selectedIds.size} pedido{selectedIds.size !== 1 ? "s" : ""} selecionado{selectedIds.size !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-surface-400 hover:text-white inline-flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Limpar
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              disabled={bulking}
              onClick={() => runBulkAction("cancel", "Cancelar")}
              className="text-red-400 border-red-500/30 hover:bg-red-500/10"
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancelar
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={bulking}
              onClick={() => runBulkAction("expire", "Expirar")}
            >
              <Clock className="h-3.5 w-3.5" />
              Expirar
            </Button>
            {bulking && <Loader2 className="h-4 w-4 animate-spin text-primary-400" />}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--border)] py-16 text-[var(--muted-foreground)]">
          <ShoppingCart className="mb-3 h-12 w-12 opacity-40" />
          <p className="text-lg font-medium">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={orders as unknown as (AdminOrder & Record<string, unknown>)[]}
          pagination={{
            page,
            pages,
            total,
            onPageChange: setPage,
          }}
        />
      )}
    </div>
  );
}
