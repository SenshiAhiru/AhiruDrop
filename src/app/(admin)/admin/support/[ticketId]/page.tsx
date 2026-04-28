"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, Loader2, Mail, Calendar } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { TicketChat, type ChatMessage } from "@/components/support/ticket-chat";
import { useToast } from "@/components/ui/toast";
import { SUPPORT_CATEGORIES } from "@/constants/support";
import { usePoll } from "@/hooks/use-poll";

type TicketDetail = {
  id: string;
  subject: string;
  category: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  messages: ChatMessage[];
};

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Aberto" },
  { value: "IN_PROGRESS", label: "Em andamento" },
  { value: "RESOLVED", label: "Resolvido" },
  { value: "CLOSED", label: "Fechado" },
];

export default function AdminTicketDetailPage() {
  const params = useParams();
  const ticketId = params.ticketId as string;
  const { data: session } = useSession();
  const { addToast } = useToast();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`, { cache: "no-store" });
      const json = await res.json();
      if (!json.success) {
        if (!opts?.silent) setError(json.error || "Falha ao carregar");
        return;
      }
      setTicket(json.data);
      setError(null);
    } catch {
      if (!opts?.silent) setError("Erro de conexão");
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    load();
  }, [load]);

  usePoll(() => load({ silent: true }), 1500);

  async function handleSend(body: string) {
    const res = await fetch(`/api/support/tickets/${ticketId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const json = await res.json();
    if (!json.success) {
      addToast({ type: "error", message: json.error || "Falha ao enviar" });
      throw new Error(json.error);
    }
    await load();
  }

  async function handleStatusChange(newStatus: string) {
    if (!ticket || newStatus === ticket.status) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/support/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!json.success) {
        addToast({ type: "error", message: json.error || "Falha ao atualizar status" });
        return;
      }
      addToast({ type: "success", message: `Status alterado para ${STATUS_OPTIONS.find((s) => s.value === newStatus)?.label}` });
      await load();
    } catch {
      addToast({ type: "error", message: "Erro de conexão" });
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Link href="/admin/support" className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {error || "Ticket não encontrado"}
        </div>
      </div>
    );
  }

  const category = SUPPORT_CATEGORIES.find((c) => c.value === ticket.category);

  return (
    <div className="space-y-4 max-w-6xl">
      <Link href="/admin/support" className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Voltar para todos os tickets
      </Link>

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-[var(--foreground)]">{ticket.subject}</h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-surface-500">
            <span className="font-mono">#{ticket.id.slice(-8)}</span>
            {category && <span>· {category.label}</span>}
            <span>· aberto em {new Date(ticket.createdAt).toLocaleString("pt-BR")}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-surface-400">Status:</label>
          <Select
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updatingStatus}
            className="w-44"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
          {updatingStatus && <Loader2 className="h-4 w-4 animate-spin text-primary-500" />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chat */}
        <div className="lg:col-span-2">
          <TicketChat
            messages={ticket.messages}
            currentUserId={session?.user?.id ?? ""}
            canSend={true}
            onSend={handleSend}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-surface-500">Usuário</p>
              <div className="flex items-center gap-3">
                {ticket.user.avatarUrl ? (
                  <Image
                    src={ticket.user.avatarUrl}
                    alt={ticket.user.name}
                    width={48}
                    height={48}
                    className="rounded-full border border-surface-700"
                    unoptimized
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-lg font-bold text-primary-400">
                    {ticket.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{ticket.user.name}</p>
                  <p className="text-xs text-surface-400 truncate">{ticket.user.email}</p>
                </div>
              </div>
              <Link
                href={`/admin/users/${ticket.user.id}`}
                className="inline-block w-full text-center rounded-lg border border-surface-700 px-3 py-1.5 text-xs font-semibold text-surface-300 hover:bg-surface-800"
              >
                Ver perfil do usuário
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-surface-500">
                Detalhes do Ticket
              </p>
              <div className="flex items-center gap-2 text-surface-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  Aberto: {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-surface-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  Atualizado: {new Date(ticket.updatedAt).toLocaleString("pt-BR")}
                </span>
              </div>
              {ticket.closedAt && (
                <div className="flex items-center gap-2 text-surface-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Fechado: {new Date(ticket.closedAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-surface-400">
                <Mail className="h-3.5 w-3.5" />
                <a href={`mailto:${ticket.user.email}`} className="text-primary-400 hover:underline truncate">
                  {ticket.user.email}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
