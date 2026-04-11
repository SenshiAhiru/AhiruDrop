"use client";

import { useState } from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  Shield,
  Ban,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/data-table";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

const mockUsers = [
  { id: "u1", name: "Maria Silva", email: "maria@email.com", role: "USER", status: "ACTIVE", orders: 12, createdAt: "2026-01-15" },
  { id: "u2", name: "Joao Santos", email: "joao@email.com", role: "USER", status: "ACTIVE", orders: 8, createdAt: "2026-02-01" },
  { id: "u3", name: "Ana Costa", email: "ana@email.com", role: "ADMIN", status: "ACTIVE", orders: 3, createdAt: "2026-01-10" },
  { id: "u4", name: "Pedro Lima", email: "pedro@email.com", role: "USER", status: "BLOCKED", orders: 0, createdAt: "2026-03-05" },
  { id: "u5", name: "Julia Rocha", email: "julia@email.com", role: "USER", status: "ACTIVE", orders: 25, createdAt: "2025-12-20" },
  { id: "u6", name: "Lucas Alves", email: "lucas@email.com", role: "USER", status: "ACTIVE", orders: 5, createdAt: "2026-03-18" },
  { id: "u7", name: "Carla Souza", email: "carla@email.com", role: "USER", status: "ACTIVE", orders: 15, createdAt: "2026-01-25" },
  { id: "u8", name: "Rafael Dias", email: "rafael@email.com", role: "USER", status: "BLOCKED", orders: 1, createdAt: "2026-04-01" },
];

const roleVariant: Record<string, "default" | "accent"> = {
  ADMIN: "accent",
  USER: "outline" as "default",
};

type UserRow = (typeof mockUsers)[number] & Record<string, unknown>;

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [actionsOpen, setActionsOpen] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({ open: false, title: "", description: "", action: () => {} });

  const filtered = mockUsers.filter((u) => {
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
    {
      key: "actions",
      label: "Acoes",
      render: (item) => (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              setActionsOpen(actionsOpen === (item.id as string) ? null : (item.id as string))
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {actionsOpen === (item.id as string) && (
            <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-[var(--border)] bg-[var(--card)] py-1 shadow-xl">
              <button className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--muted)]/50">
                <Eye className="h-4 w-4" /> Ver perfil
              </button>
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--muted)]/50"
                onClick={() => {
                  setActionsOpen(null);
                  setConfirmDialog({
                    open: true,
                    title: "Alterar Role",
                    description: `Alterar role de ${item.name} para ${(item.role as string) === "ADMIN" ? "USER" : "ADMIN"}?`,
                    action: () => setConfirmDialog((prev) => ({ ...prev, open: false })),
                  });
                }}
              >
                <Shield className="h-4 w-4" /> Alterar role
              </button>
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-[var(--muted)]/50"
                onClick={() => {
                  setActionsOpen(null);
                  const isBlocked = (item.status as string) === "BLOCKED";
                  setConfirmDialog({
                    open: true,
                    title: isBlocked ? "Desbloquear Usuario" : "Bloquear Usuario",
                    description: isBlocked
                      ? `Desbloquear ${item.name}? O usuario podera acessar a plataforma novamente.`
                      : `Bloquear ${item.name}? O usuario nao podera acessar a plataforma.`,
                    action: () => setConfirmDialog((prev) => ({ ...prev, open: false })),
                  });
                }}
              >
                {(item.status as string) === "BLOCKED" ? (
                  <Unlock className="h-4 w-4" />
                ) : (
                  <Ban className="h-4 w-4" />
                )}
                {(item.status as string) === "BLOCKED" ? "Desbloquear" : "Bloquear"}
              </button>
            </div>
          )}
        </div>
      ),
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

      {/* Table */}
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

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
      >
        <DialogClose onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))} />
        <DialogHeader>
          <DialogTitle>{confirmDialog.title}</DialogTitle>
          <DialogDescription>{confirmDialog.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
          >
            Cancelar
          </Button>
          <Button onClick={confirmDialog.action}>Confirmar</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
