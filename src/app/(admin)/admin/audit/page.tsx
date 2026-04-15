"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import {
  Activity,
  Loader2,
  Search,
  User,
  Trophy,
  Coins,
  Shield,
  Edit,
  Trash2,
  Plus,
  LogIn,
  DollarSign,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type AuditItem = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, any> | null;
  ipAddress: string | null;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    email: string;
  };
};

// Known action groups for filter + icon selection
const ACTION_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  USER_UPDATED: { label: "Usuário atualizado", icon: User, color: "text-blue-400" },
  USER_BALANCE_CREDITED: { label: "Saldo creditado", icon: Plus, color: "text-emerald-400" },
  USER_BALANCE_DEBITED: { label: "Saldo debitado", icon: DollarSign, color: "text-red-400" },
  DRAW_EXECUTED: { label: "Sorteio realizado", icon: Trophy, color: "text-accent-400" },
  RAFFLE_CREATED: { label: "Rifa criada", icon: Plus, color: "text-primary-400" },
  RAFFLE_UPDATED: { label: "Rifa atualizada", icon: Edit, color: "text-blue-400" },
  RAFFLE_DELETED: { label: "Rifa deletada", icon: Trash2, color: "text-red-400" },
  LOGIN: { label: "Login", icon: LogIn, color: "text-surface-400" },
};

function actionMeta(action: string) {
  return (
    ACTION_META[action] || {
      label: action,
      icon: Activity,
      color: "text-surface-400",
    }
  );
}

export default function AuditPage() {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityTypeFilter, setEntityTypeFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [exporting, setExporting] = useState(false);
  const { addToast } = useToast();

  async function downloadCSV() {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== "ALL") params.set("action", actionFilter);
      if (entityTypeFilter !== "ALL") params.set("entityType", entityTypeFilter);
      if (search) params.set("entityId", search.trim());
      const res = await fetch(`/api/admin/audit/export?${params}`, { cache: "no-store" });
      if (!res.ok) {
        addToast({ type: "error", message: "Falha ao exportar" });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `auditoria-${new Date().toISOString().split("T")[0]}.csv`;
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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== "ALL") params.set("action", actionFilter);
      if (entityTypeFilter !== "ALL") params.set("entityType", entityTypeFilter);
      if (search) params.set("entityId", search.trim());
      params.set("page", String(page));
      params.set("limit", "50");

      const res = await fetch(`/api/admin/audit?${params}`, { cache: "no-store" });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Falha ao carregar");
        return;
      }
      setItems(json.data.data);
      setPages(json.data.pages || 1);
      setTotal(json.data.total || 0);
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }, [actionFilter, entityTypeFilter, search, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  function entityLink(entityType: string, entityId: string): string | null {
    switch (entityType) {
      case "user":
        return `/admin/users/${entityId}`;
      case "raffle":
        return `/admin/raffles/${entityId}`;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary-400" />
            <h1 className="text-2xl font-bold tracking-tight">Auditoria</h1>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {total} evento{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="outline" onClick={downloadCSV} disabled={exporting || total === 0}>
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Buscar por ID da entidade (user ID, raffle ID)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-56"
        >
          <option value="ALL">Todas as ações</option>
          <option value="DRAW_EXECUTED">Sorteios</option>
          <option value="USER_BALANCE_CREDITED">Crédito de saldo</option>
          <option value="USER_BALANCE_DEBITED">Débito de saldo</option>
          <option value="USER_UPDATED">Usuário atualizado</option>
          <option value="RAFFLE_CREATED">Rifa criada</option>
          <option value="RAFFLE_UPDATED">Rifa atualizada</option>
          <option value="RAFFLE_DELETED">Rifa deletada</option>
          <option value="LOGIN">Logins</option>
        </Select>
        <Select
          value={entityTypeFilter}
          onChange={(e) => {
            setEntityTypeFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-40"
        >
          <option value="ALL">Todos os tipos</option>
          <option value="user">Usuário</option>
          <option value="raffle">Rifa</option>
          <option value="order">Pedido</option>
          <option value="payment">Pagamento</option>
        </Select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Activity className="h-10 w-10 mx-auto text-surface-600 mb-3" />
            <p className="text-surface-400">Nenhum evento de auditoria encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const meta = actionMeta(item.action);
            const Icon = meta.icon;
            const link = entityLink(item.entityType, item.entityId);

            return (
              <div
                key={item.id}
                className="rounded-lg border border-surface-700 bg-surface-900/40 p-4 hover:border-surface-600 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-surface-800 ${meta.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-white">
                            {meta.label}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {item.entityType}
                          </Badge>
                        </div>
                        <div className="mt-1 text-xs text-surface-400">
                          <span className="font-medium text-surface-300">{item.actor.name}</span>
                          <span className="text-surface-500"> · {item.actor.email}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-surface-500">
                          {new Date(item.createdAt).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {link ? (
                          <Link
                            href={link}
                            className="text-xs font-mono text-primary-400 hover:text-primary-300 truncate inline-block max-w-[180px]"
                            title={item.entityId}
                          >
                            {item.entityId.slice(-12)}
                          </Link>
                        ) : (
                          <p className="text-xs font-mono text-surface-500 truncate max-w-[180px]" title={item.entityId}>
                            {item.entityId.slice(-12)}
                          </p>
                        )}
                      </div>
                    </div>

                    {item.metadata && Object.keys(item.metadata).length > 0 && (
                      <details className="mt-2 text-xs">
                        <summary className="text-surface-500 cursor-pointer hover:text-surface-300 select-none">
                          Ver detalhes
                        </summary>
                        <pre className="mt-2 p-2 rounded bg-surface-800/60 text-surface-300 overflow-x-auto font-mono text-[10px]">
                          {JSON.stringify(item.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && pages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-surface-800">
          <p className="text-xs text-surface-400">
            Página {page} de {pages} · {total} evento{total !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
