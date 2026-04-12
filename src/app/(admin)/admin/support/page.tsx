"use client";

import { useState } from "react";
import {
  Search,
  MessageSquare,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/data-table";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const statusTabs = ["TODOS", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const statusLabels: Record<string, string> = {
  TODOS: "Todos",
  OPEN: "Abertos",
  IN_PROGRESS: "Em Andamento",
  RESOLVED: "Resolvidos",
  CLOSED: "Fechados",
};

const statusVariant: Record<
  string,
  "warning" | "default" | "success" | "outline"
> = {
  OPEN: "warning",
  IN_PROGRESS: "default",
  RESOLVED: "success",
  CLOSED: "outline",
};

const priorityLabels: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente",
};

interface Ticket {
  id: string;
  usuario: string;
  assunto: string;
  status: string;
  prioridade: string;
  data: string;
}

const tickets: Ticket[] = [];

type TicketRow = Ticket & Record<string, unknown>;

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("TODOS");
  const [page, setPage] = useState(1);

  const filtered = tickets.filter((t) => {
    if (activeTab !== "TODOS" && t.status !== activeTab) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.usuario.toLowerCase().includes(q) ||
        t.assunto.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const columns: Column<TicketRow>[] = [
    {
      key: "id",
      label: "ID",
      render: (item) => (
        <span className="font-mono text-xs">{item.id as string}</span>
      ),
    },
    {
      key: "usuario",
      label: "Usuário",
      render: (item) => (
        <span className="font-medium">{item.usuario as string}</span>
      ),
    },
    { key: "assunto", label: "Assunto" },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <Badge
          variant={statusVariant[item.status as string] ?? "outline"}
        >
          {statusLabels[item.status as string] ?? (item.status as string)}
        </Badge>
      ),
    },
    {
      key: "prioridade",
      label: "Prioridade",
      render: (item) => {
        const prio = item.prioridade as string;
        return (
          <span
            className={cn(
              "text-sm font-medium",
              prio === "URGENT" && "text-red-500",
              prio === "HIGH" && "text-orange-500",
              prio === "MEDIUM" && "text-yellow-500",
              prio === "LOW" && "text-[var(--muted-foreground)]"
            )}
          >
            {priorityLabels[prio] ?? prio}
          </span>
        );
      },
    },
    {
      key: "data",
      label: "Data",
      render: (item) => formatDate(item.data as string),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Suporte</h1>

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
            {statusLabels[tab]}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <Input
          placeholder="Buscar por ID, usuário ou assunto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table or Empty State */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--border)] py-16 text-[var(--muted-foreground)]">
          <MessageSquare className="mb-3 h-12 w-12 opacity-40" />
          <p className="text-lg font-medium">Nenhum ticket de suporte</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered as unknown as TicketRow[]}
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
