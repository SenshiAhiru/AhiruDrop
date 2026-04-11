"use client";

import { useState } from "react";
import {
  Search,
  MessageSquare,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

const mockTickets: Ticket[] = [
  {
    id: "TKT-001",
    usuario: "Maria Silva",
    assunto: "Pagamento nao confirmado",
    status: "OPEN",
    prioridade: "HIGH",
    data: "2026-04-11",
  },
  {
    id: "TKT-002",
    usuario: "Joao Santos",
    assunto: "Duvida sobre sorteio",
    status: "IN_PROGRESS",
    prioridade: "MEDIUM",
    data: "2026-04-10",
  },
  {
    id: "TKT-003",
    usuario: "Ana Costa",
    assunto: "Numeros nao apareceram",
    status: "RESOLVED",
    prioridade: "HIGH",
    data: "2026-04-09",
  },
  {
    id: "TKT-004",
    usuario: "Pedro Lima",
    assunto: "Solicitar reembolso",
    status: "OPEN",
    prioridade: "URGENT",
    data: "2026-04-11",
  },
];

type TicketRow = Ticket & Record<string, unknown>;

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("TODOS");
  const [page, setPage] = useState(1);
  const [actionsOpen, setActionsOpen] = useState<string | null>(null);

  const filtered = mockTickets.filter((t) => {
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
      label: "Usuario",
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
    {
      key: "actions",
      label: "",
      render: (item) => (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              setActionsOpen(
                actionsOpen === (item.id as string)
                  ? null
                  : (item.id as string)
              )
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {actionsOpen === (item.id as string) && (
            <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-lg border border-[var(--border)] bg-[var(--card)] py-1 shadow-xl">
              <button className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--muted)]/50">
                <Eye className="h-4 w-4" /> Ver ticket
              </button>
              <button className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--muted)]/50">
                <MessageSquare className="h-4 w-4" /> Responder
              </button>
            </div>
          )}
        </div>
      ),
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
          placeholder="Buscar por ID, usuario ou assunto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
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
    </div>
  );
}
