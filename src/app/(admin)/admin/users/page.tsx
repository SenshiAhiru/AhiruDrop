"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  Loader2,
  ShieldCheck,
  Shield,
  UserCheck,
  UserX,
  Trophy,
  Eye,
  Download,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/admin/data-table";
import { formatDate } from "@/lib/utils";

type SortField =
  | "name"
  | "email"
  | "balance"
  | "createdAt"
  | "totalSpent"
  | "orderCount"
  | "winCount";

type SortOrder = "asc" | "desc";

function SortHeader({
  field,
  label,
  sortBy,
  sortOrder,
  onToggle,
}: {
  field: SortField;
  label: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  onToggle: (field: SortField) => void;
}) {
  const active = sortBy === field;
  const Icon = !active ? ArrowUpDown : sortOrder === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={() => onToggle(field)}
      className={`flex items-center gap-1.5 uppercase tracking-wider transition-colors ${
        active ? "text-primary-400" : "hover:text-white"
      }`}
    >
      {label}
      <Icon className={`h-3 w-3 ${active ? "" : "opacity-40"}`} />
    </button>
  );
}

type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "USER" | "ADMIN";
  avatarUrl: string | null;
  balance: number;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  winCount: number;
};

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const buildParams = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter !== "ALL") params.set("role", roleFilter);
    if (statusFilter !== "ALL") params.set("isActive", statusFilter === "ACTIVE" ? "true" : "false");
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    return params;
  }, [search, roleFilter, statusFilter, sortBy, sortOrder]);

  const toggleSort = useCallback(
    (field: SortField) => {
      setSortBy((prevBy) => {
        if (prevBy === field) {
          setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
          return prevBy;
        }
        setSortOrder("desc");
        return field;
      });
      setPage(1);
    },
    []
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = buildParams();
      params.set("page", String(page));
      params.set("limit", "50");

      const res = await fetch(`/api/admin/users?${params}`, { cache: "no-store" });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Falha ao carregar");
        return;
      }
      setUsers(json.data.data);
      setPages(json.data.pages || 1);
      setTotal(json.data.total || 0);
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }, [buildParams, page]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce search
    return () => clearTimeout(t);
  }, [load]);

  async function downloadCSV() {
    setExporting(true);
    try {
      const params = buildParams();
      const res = await fetch(`/api/admin/users/export?${params}`, { cache: "no-store" });
      if (!res.ok) {
        alert("Falha ao exportar");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `usuarios-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Erro de conexão");
    } finally {
      setExporting(false);
    }
  }

  async function toggleActive(user: AdminUser) {
    setUpdatingId(user.id);
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, isActive: !user.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
        );
      } else {
        alert(json.error || "Falha ao atualizar");
      }
    } catch {
      alert("Erro de conexão");
    } finally {
      setUpdatingId(null);
    }
  }

  async function toggleRole(user: AdminUser) {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`Mudar role de ${user.name} para ${newRole}?`)) return;
    setUpdatingId(user.id);
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, role: newRole }),
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
        );
      } else {
        alert(json.error || "Falha ao atualizar");
      }
    } catch {
      alert("Erro de conexão");
    } finally {
      setUpdatingId(null);
    }
  }

  const columns: Column<AdminUser & Record<string, unknown>>[] = [
    {
      key: "name",
      label: (
        <SortHeader
          field="name"
          label="Usuário"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onToggle={toggleSort}
        />
      ),
      render: (item) => (
        <Link
          href={`/admin/users/${item.id}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          {item.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.avatarUrl as string}
              alt={item.name as string}
              className="h-9 w-9 rounded-full border border-surface-700"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-sm font-bold text-primary-400">
              {(item.name as string).charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-sm truncate hover:text-primary-400">
              {item.name as string}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] truncate">
              {item.email as string}
            </p>
          </div>
        </Link>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (item) => (
        <Badge variant={(item.role as string) === "ADMIN" ? "accent" : "default"}>
          {item.role as string}
        </Badge>
      ),
    },
    {
      key: "balance",
      label: (
        <SortHeader
          field="balance"
          label="Saldo"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onToggle={toggleSort}
        />
      ),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ahc-coin.png" alt="" className="h-4 w-4 rounded-full" />
          <span className="font-mono text-sm font-semibold text-accent-400">
            {(item.balance as number).toFixed(2)}
          </span>
        </div>
      ),
    },
    {
      key: "orderCount",
      label: (
        <SortHeader
          field="orderCount"
          label="Pedidos"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onToggle={toggleSort}
        />
      ),
      render: (item) => (
        <span className="text-sm font-medium">{item.orderCount as number}</span>
      ),
    },
    {
      key: "totalSpent",
      label: (
        <SortHeader
          field="totalSpent"
          label="Gasto total"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onToggle={toggleSort}
        />
      ),
      render: (item) => (
        <span className="font-mono text-xs text-surface-400">
          {(item.totalSpent as number).toFixed(2)} AHC
        </span>
      ),
    },
    {
      key: "winCount",
      label: (
        <SortHeader
          field="winCount"
          label="Vitórias"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onToggle={toggleSort}
        />
      ),
      render: (item) => {
        const count = item.winCount as number;
        if (count === 0) return <span className="text-xs text-surface-600">—</span>;
        return (
          <span className="inline-flex items-center gap-1 text-accent-400 text-xs font-bold">
            <Trophy className="h-3 w-3" />
            {count}
          </span>
        );
      },
    },
    {
      key: "isActive",
      label: "Status",
      render: (item) => (
        <Badge variant={(item.isActive as boolean) ? "success" : "danger"}>
          {(item.isActive as boolean) ? "Ativo" : "Bloqueado"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: (
        <SortHeader
          field="createdAt"
          label="Cadastro"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onToggle={toggleSort}
        />
      ),
      render: (item) => (
        <span className="text-xs text-surface-400">
          {formatDate(item.createdAt as string)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (item) => {
        const user = item as unknown as AdminUser;
        const isUpdating = updatingId === user.id;
        return (
          <div className="flex items-center gap-1 justify-end">
            <Link href={`/admin/users/${user.id}`} title="Ver detalhes">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title={user.role === "ADMIN" ? "Rebaixar para User" : "Promover a Admin"}
              disabled={isUpdating}
              onClick={() => toggleRole(user)}
            >
              {user.role === "ADMIN" ? (
                <Shield className="h-4 w-4 text-accent-400" />
              ) : (
                <ShieldCheck className="h-4 w-4 text-surface-400" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${user.isActive ? "text-red-400 hover:text-red-300 hover:bg-red-500/10" : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"}`}
              title={user.isActive ? "Bloquear" : "Desbloquear"}
              disabled={isUpdating}
              onClick={() => toggleActive(user)}
            >
              {user.isActive ? (
                <UserX className="h-4 w-4" />
              ) : (
                <UserCheck className="h-4 w-4" />
              )}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {total} usuário{total !== 1 ? "s" : ""} cadastrado{total !== 1 ? "s" : ""}
            {total > 0 && (search || roleFilter !== "ALL" || statusFilter !== "ALL") && " com os filtros aplicados"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={downloadCSV}
          disabled={exporting || total === 0}
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Buscar por nome, email, CPF, Steam ID ou telefone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-40"
        >
          <option value="ALL">Todos os roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-40"
        >
          <option value="ALL">Todos os status</option>
          <option value="ACTIVE">Ativos</option>
          <option value="BLOCKED">Bloqueados</option>
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
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--border)] py-16 text-[var(--muted-foreground)]">
          <Users className="mb-3 h-12 w-12 opacity-40" />
          <p className="text-lg font-medium">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={users as unknown as (AdminUser & Record<string, unknown>)[]}
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
