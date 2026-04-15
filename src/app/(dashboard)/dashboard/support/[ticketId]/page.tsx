"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  messages: ChatMessage[];
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

export default function UserTicketDetailPage() {
  const params = useParams();
  const ticketId = params.ticketId as string;
  const { data: session } = useSession();
  const { addToast } = useToast();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Poll for new messages every 1.5s (silent so UI doesn't flicker)
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Link href="/dashboard/support" className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {error || "Ticket não encontrado"}
        </div>
      </div>
    );
  }

  const category = SUPPORT_CATEGORIES.find((c) => c.value === ticket.category);
  const canSend = ticket.status !== "CLOSED";

  return (
    <div className="space-y-4 max-w-4xl">
      <Link href="/dashboard/support" className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Voltar para meus tickets
      </Link>

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[var(--foreground)]">{ticket.subject}</h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-surface-500">
            <span className="font-mono">#{ticket.id.slice(-8)}</span>
            {category && <span>· {category.label}</span>}
            <span>· aberto em {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}</span>
          </div>
        </div>
        <Badge variant={STATUS_VARIANT[ticket.status]}>{STATUS_LABEL[ticket.status]}</Badge>
      </div>

      <TicketChat
        messages={ticket.messages}
        currentUserId={session?.user?.id ?? ""}
        canSend={canSend}
        disabledReason={!canSend ? "Este ticket está fechado. Abra um novo ticket para continuar." : null}
        onSend={handleSend}
      />
    </div>
  );
}
