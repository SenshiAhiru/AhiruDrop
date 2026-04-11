"use client";

import { useState } from "react";
import {
  Search,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/data-table";
import { formatDate } from "@/lib/utils";

const users: {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  orders: number;
  createdAt: string;
}[] = [];

type UserRow = (typeof users)[number] & Record<string, unknown>;

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const filtered = users.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const columns: Column<UserRow>[] = [
    {
      key: "name",
      label: "Nome",
      render: (item) => (
        <div>
          <p className="font-medium">{item.name as string}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{item.email as string}</p>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (item) => (
        <Badge variant={(item.role as string) === "ADMIN" ? "accent" : "outline"}>
          {item.role as string}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <Badge variant={(item.status as string) === "ACTIVE" ? "success" : "danger"}>
          {(item.status as string) === "ACTIVE" ? "Ativo" : "Bloqueado"}
        </Badge>
      ),
    },
    { key: "orders", label: "Pedidos" },
    {
      key: "createdAt",
      label: "Cadastro",
      render: (item) => formatDate(item.createdAt as string),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-40"
        >
          <option value="ALL">Todos os roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
        </Select>
      </div>

      {/* Table or Empty State */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--border)] py-16 text-[var(--muted-foreground)]">
          <Users className="mb-3 h-12 w-12 opacity-40" />
          <p className="text-lg font-medium">Nenhum usuario encontrado</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered as unknown as UserRow[]}
          pagination={{
            page,
            pages: Math.max(1, Math.ceil(filtered.length / 10)),
            total: filtered.length,
            onPageChange: setPage,
          }}
        />
      )}
    </div>
  );
}
