"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, MessageSquare, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SUPPORT_CATEGORIES } from "@/constants/support";

type TicketRow = {
  id: string;
  subject: string;
  category: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  unreadForAdmin: number;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  messages: { body: string; senderRole: string; createdAt: string }[];
};

const STATUS_TABS = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
const TAB_LABEL: Record<string, string> = {
  ALL: "Todos",
  OPEN: "Abertos",
  IN_PROGRESS: "Em Andamento",
  RESOLVED: "Resolvidos",
  CLOSED: "Fechados",
};
const STATUS_LABEL: Record<string, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em andamento",
  RESOLVED: "Resolvido",
  CLOSED: "Fechado",
};
const STATUS_VARIANT: Record<string, "default" | "warning" | "success" | "danger"> = {
  OPEN: "warning",
  IN_PROGRESS: "default",
  RESOLVED: "success",
  CLOSED: "default",
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [openCount, setOpenCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "ALL") params.set("status", activeTab);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("limit", "50");

      const res = await fetch(`/api/admin/support?${params}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setTickets(json.data.data);
        setPages(json.data.pages);
        setTotal(json.data.total);
        setOpenCount(json.data.openCount);
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, categoryFilter, search, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary-400" />
            <h1 className="text-2xl font-bold tracking-tight">Suporte</h1>
            {openCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-primary-600/20 border border-primary-500/40 px-2 py-0.5 text-xs font-bold text-primary-400">
                {openCount} em aberto
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {total} ticket{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-1">
        {STATUS_TABS.map((tab) => (
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
            {TAB_LABEL[tab]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Buscar por ID, usuário, email ou assunto..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-60"
        >
          <option value="ALL">Todas as categorias</option>
          {SUPPORT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="h-10 w-10 mx-auto text-surface-600 mb-3" />
            <p className="text-surface-400">Nenhum ticket de suporte</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => {
            const lastMsg = t.messages[0];
            const category = SUPPORT_CATEGORIES.find((c) => c.value === t.category);
            return (
              <Link
                key={t.id}
                href={`/admin/support/${t.id}`}
                className="block rounded-xl border border-surface-700 bg-surface-900/40 p-4 hover:border-primary-500/40 hover:bg-surface-900/70 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {t.user.avatarUrl ? (
                    <Image
                      src={t.user.avatarUrl}
                      alt={t.user.name}
                      width={40}
                      height={40}
                      unoptimized
                      className="rounded-full border border-surface-700 shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-sm font-bold text-primary-400 shrink-0">
                      {t.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[var(--foreground)] truncate">
                          {t.subject}
                        </h3>
                        <p className="text-xs text-surface-500 truncate">
                          {t.user.name} · {t.user.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {t.unreadForAdmin > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-red-500/20 border border-red-500/40 text-red-400 px-2 py-0.5">
                            {t.unreadForAdmin} nova{t.unreadForAdmin > 1 ? "s" : ""}
                          </span>
                        )}
                        <Badge variant={STATUS_VARIANT[t.status]}>{STATUS_LABEL[t.status]}</Badge>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-surface-500">
                      <span className="font-mono">#{t.id.slice(-8)}</span>
                      {category && <span>· {category.label}</span>}
                      <span>
                        ·{" "}
                        {new Date(t.updatedAt).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {lastMsg && (
                      <p className="mt-2 text-sm text-surface-400 line-clamp-2">
                        <span className="font-semibold text-surface-300">
                          {lastMsg.senderRole === "ADMIN" ? "Você" : t.user.name.split(" ")[0]}:
                        </span>{" "}
                        {lastMsg.body}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-surface-800">
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
  );
}
