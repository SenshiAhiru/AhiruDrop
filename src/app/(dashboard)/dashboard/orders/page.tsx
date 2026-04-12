"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, ChevronLeft, ChevronRight, Package } from "lucide-react";

type OrderStatus = "pending" | "confirmed" | "cancelled";
type StatusFilter = "all" | OrderStatus;

// Empty until API is connected
const allOrders: {
  id: string;
  raffleName: string;
  quantity: number;
  total: number;
  status: OrderStatus;
  date: string;
}[] = [];

const statusConfig = {
  pending: { label: "Pendente", variant: "warning" as const },
  confirmed: { label: "Confirmado", variant: "success" as const },
  cancelled: { label: "Cancelado", variant: "danger" as const },
};

const tabs: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "pending", label: "Pendentes" },
  { key: "confirmed", label: "Confirmados" },
  { key: "cancelled", label: "Cancelados" },
];

const PAGE_SIZE = 6;

export default function OrdersPage() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [isLoading] = useState(false);

  const filtered = filter === "all"
    ? allOrders
    : allOrders.filter((o) => o.status === filter);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilterChange(f: StatusFilter) {
    setFilter(f);
    setPage(1);
  }

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Meus Pedidos</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Gerencie todos os seus pedidos de rifas
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-xl bg-surface-900 p-1 border border-[var(--border)] overflow-x-auto">
        {tabs.map((tab) => {
          const count = tab.key === "all"
            ? allOrders.length
            : allOrders.filter((o) => o.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => handleFilterChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filter === tab.key
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filter === tab.key
                    ? "bg-white/20"
                    : "bg-[var(--muted)]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {paginated.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)]">
                <Package className="h-8 w-8 text-[var(--muted-foreground)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                Nenhum pedido encontrado
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] max-w-xs">
                Você ainda não fez nenhum pedido. Participe de uma rifa!
              </p>
              <Link href="/raffles">
                <Button variant="default" className="mt-2">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Ver rifas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {paginated.map((order) => (
            <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
              <Card className="hover:border-primary-500/30 transition-all cursor-pointer group">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10 flex-shrink-0">
                        <ShoppingCart className="h-5 w-5 text-primary-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)] truncate group-hover:text-primary-400 transition-colors">
                          {order.raffleName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                          <span className="font-mono">#{order.id.slice(-6)}</span>
                          <span>&middot;</span>
                          <span>{order.quantity} cotas</span>
                          <span>&middot;</span>
                          <span>{new Date(order.date).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-semibold text-[var(--foreground)] hidden sm:inline">
                        R$ {order.total.toFixed(2)}
                      </span>
                      <Badge variant={statusConfig[order.status].variant}>
                        {statusConfig[order.status].label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--muted-foreground)]">
            Mostrando {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(p)}
                className="w-8"
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
