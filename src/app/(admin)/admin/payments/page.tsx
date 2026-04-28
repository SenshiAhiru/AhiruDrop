"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, DollarSign, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

type Payment = {
  id: string;
  orderId: string;
  status: "PENDING" | "APPROVED" | "EXPIRED" | "REFUNDED" | "FAILED";
  amount: string | number;
  currency: string;
  method: string | null;
  externalId: string | null;
  paidAt: string | null;
  createdAt: string;
  gateway: { id: string; name: string; displayName: string };
  order: {
    id: string;
    status: string;
    user: {
      name: string;
      email: string;
      avatarUrl: string | null;
    } | null;
  };
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  APPROVED: "success",
  PENDING: "warning",
  EXPIRED: "default",
  REFUNDED: "default",
  FAILED: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  APPROVED: "Aprovado",
  PENDING: "Pendente",
  EXPIRED: "Expirado",
  REFUNDED: "Reembolsado",
  FAILED: "Falhou",
};

type Gateway = { id: string; name: string; displayName: string };

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [gatewayFilter, setGatewayFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch gateways once to populate filter
  useEffect(() => {
    fetch("/api/admin/gateways", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setGateways(json.data.map((g: any) => ({
            id: g.id,
            name: g.name,
            displayName: g.displayName ?? g.name,
          })));
        }
      })
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (gatewayFilter !== "ALL") params.set("gateway", gatewayFilter);
      params.set("page", String(page));
      params.set("limit", "50");

      const res = await fetch(`/api/admin/payments?${params}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setPayments(json.data.data);
        setPages(json.data.pages ?? 1);
        setTotal(json.data.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, gatewayFilter, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pagamentos</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          {total} pagamento{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Buscar por ID, pedido, nome ou email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
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
          onChange={(e) => {
            setGatewayFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-44"
        >
          <option value="ALL">Todos gateways</option>
          {gateways.map((g) => (
            <option key={g.id} value={g.id}>
              {g.displayName}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--border)] py-16 text-[var(--muted-foreground)]">
          <DollarSign className="mb-3 h-12 w-12 opacity-40" />
          <p className="text-lg font-medium">Nenhum pagamento encontrado</p>
        </div>
      ) : (
        <div className="rounded-xl border border-surface-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-900/60 border-b border-surface-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Usuário</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Gateway</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-surface-400">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Método</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-900/40 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-surface-400">
                      #{p.id.slice(-8)}
                    </td>
                    <td className="px-4 py-3">
                      {p.order?.user ? (
                        <div className="flex items-center gap-2">
                          {p.order.user.avatarUrl ? (
                            <Image
                              src={p.order.user.avatarUrl}
                              alt=""
                              width={28}
                              height={28}
                              className="rounded-full border border-surface-700"
                              unoptimized
                            />
                          ) : (
                            <div className="h-7 w-7 rounded-full bg-primary-500/20 flex items-center justify-center text-[10px] font-bold text-primary-400">
                              {p.order.user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate max-w-[160px]">{p.order.user.name}</p>
                            <p className="text-[10px] text-surface-500 truncate max-w-[160px]">{p.order.user.email}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-surface-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default" className="text-[10px]">
                        {p.gateway.displayName}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono font-semibold text-sm">
                        {Number(p.amount).toFixed(2)} {p.currency}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[p.status] ?? "default"} className="text-[10px]">
                        {STATUS_LABEL[p.status] ?? p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-400">
                      {p.method ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-400">
                      {formatDateTime(p.paidAt ?? p.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-surface-800 bg-surface-900/30">
              <p className="text-xs text-surface-400">
                Página {page} de {pages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
