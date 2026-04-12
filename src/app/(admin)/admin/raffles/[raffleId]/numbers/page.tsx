"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { Grid3X3, List, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/admin/data-table";
import { cn } from "@/lib/utils";

type NumberStatus = "AVAILABLE" | "RESERVED" | "PAID";

interface RaffleNumber {
  number: number;
  status: NumberStatus;
  orderId?: string;
  user?: string;
}

const statusColor: Record<NumberStatus, string> = {
  AVAILABLE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  RESERVED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  PAID: "bg-primary-600/20 text-primary-400 border-primary-500/30",
};

const statusLabel: Record<NumberStatus, string> = {
  AVAILABLE: "Disponível",
  RESERVED: "Reservado",
  PAID: "Pago",
};

type NumberRow = RaffleNumber & Record<string, unknown>;

export default function RaffleNumbersPage() {
  const params = useParams();
  const raffleId = params.raffleId as string;

  const [numbers, setNumbers] = useState<RaffleNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchNumbers() {
      try {
        const res = await fetch(`/api/admin/raffles/${raffleId}/numbers`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setNumbers(json.data);
        }
      } catch (err) {
        console.error("Erro ao buscar números:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNumbers();
  }, [raffleId]);

  const filtered = useMemo(
    () =>
      numbers.filter((n) => {
        if (statusFilter !== "ALL" && n.status !== statusFilter) return false;
        if (search && !String(n.number).includes(search)) return false;
        return true;
      }),
    [numbers, statusFilter, search]
  );

  const counts = useMemo(
    () => ({
      available: numbers.filter((n) => n.status === "AVAILABLE").length,
      reserved: numbers.filter((n) => n.status === "RESERVED").length,
      paid: numbers.filter((n) => n.status === "PAID").length,
    }),
    [numbers]
  );

  const listColumns: Column<NumberRow>[] = [
    {
      key: "number",
      label: "Numero",
      render: (item) => (
        <span className="font-mono font-bold">
          {String(item.number as number).padStart(4, "0")}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <Badge
          variant={
            item.status === "PAID"
              ? "default"
              : item.status === "RESERVED"
              ? "warning"
              : "success"
          }
        >
          {statusLabel[item.status as NumberStatus]}
        </Badge>
      ),
    },
    {
      key: "orderId",
      label: "Pedido",
      render: (item) => (item.orderId as string) ?? "-",
    },
    {
      key: "user",
      label: "Usuário",
      render: (item) => (item.user as string) ?? "-",
    },
  ];

  const perPage = 100;
  const paginatedGrid = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Números da Rifa
      </h1>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="success" className="px-3 py-1.5 text-sm">
          Disponíveis: {counts.available}
        </Badge>
        <Badge variant="warning" className="px-3 py-1.5 text-sm">
          Reservados: {counts.reserved}
        </Badge>
        <Badge variant="default" className="px-3 py-1.5 text-sm">
          Pagos: {counts.paid}
        </Badge>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Buscar número..."
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
          <option value="ALL">Todos</option>
          <option value="AVAILABLE">Disponíveis</option>
          <option value="RESERVED">Reservados</option>
          <option value="PAID">Pagos</option>
        </Select>
        <div className="flex gap-1 rounded-lg border border-[var(--border)] p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <Card>
          <CardContent className="p-4">
            {paginatedGrid.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-[var(--muted-foreground)]">
                <p className="text-sm">Nenhum número encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(52px,1fr))] gap-1.5">
                {paginatedGrid.map((n) => (
                  <div
                    key={n.number}
                    className={cn(
                      "flex h-11 items-center justify-center rounded-lg border text-xs font-mono font-semibold transition-colors",
                      statusColor[n.status]
                    )}
                    title={`#${n.number} - ${statusLabel[n.status]}${n.user ? ` (${n.user})` : ""}`}
                  >
                    {String(n.number).padStart(3, "0")}
                  </div>
                ))}
              </div>
            )}
            {filtered.length > perPage && (
              <div className="mt-4 flex justify-center gap-2">
                {Array.from({ length: Math.ceil(filtered.length / perPage) }).map((_, i) => (
                  <Button
                    key={i}
                    variant={page === i + 1 ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={listColumns}
          data={filtered as unknown as NumberRow[]}
          pagination={{
            page,
            pages: Math.ceil(filtered.length / 50),
            total: filtered.length,
            onPageChange: setPage,
          }}
        />
      )}
    </div>
  );
}
