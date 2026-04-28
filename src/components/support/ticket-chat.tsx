"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Send, Loader2, Shield, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChatMessage = {
  id: string;
  senderRole: string; // "USER" | "ADMIN" | "SYSTEM"
  body: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
    role: string;
  } | null;
};

type Props = {
  messages: ChatMessage[];
  currentUserId: string;
  canSend: boolean;
  disabledReason?: string | null;
  onSend: (body: string) => Promise<void>;
};

export function TicketChat({ messages, currentUserId, canSend, disabledReason, onSend }: Props) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await onSend(text);
      setDraft("");
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-[60vh] rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-surface-500 py-10">
            Nenhuma mensagem ainda.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender?.id === currentUserId;
            const isAdmin = m.senderRole === "ADMIN";
            return (
              <div
                key={m.id}
                className={cn(
                  "flex items-end gap-2",
                  mine ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div className="shrink-0">
                  {m.sender?.avatarUrl ? (
                    <Image
                      src={m.sender.avatarUrl}
                      alt={m.sender.name}
                      width={32}
                      height={32}
                      unoptimized
                      className="rounded-full border border-surface-700"
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border",
                        isAdmin
                          ? "bg-accent-500/20 border-accent-500/40 text-accent-400"
                          : "bg-primary-500/20 border-primary-500/40 text-primary-400"
                      )}
                    >
                      {isAdmin ? (
                        <Shield className="h-4 w-4" />
                      ) : (
                        <UserIcon className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5",
                    mine
                      ? "bg-primary-600/90 text-white rounded-br-sm"
                      : isAdmin
                      ? "bg-accent-500/10 border border-accent-500/20 text-[var(--foreground)] rounded-bl-sm"
                      : "bg-surface-800/60 border border-surface-700 text-[var(--foreground)] rounded-bl-sm"
                  )}
                >
                  {!mine && (
                    <p
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider mb-0.5",
                        isAdmin ? "text-accent-400" : "text-surface-400"
                      )}
                    >
                      {isAdmin ? "Suporte" : m.sender?.name ?? "Usuário"}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                  <p
                    className={cn(
                      "text-[10px] mt-1 opacity-70",
                      mine ? "text-right" : "text-left"
                    )}
                  >
                    {new Date(m.createdAt).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-[var(--border)] p-3 bg-surface-950/40">
        {!canSend ? (
          <p className="text-center text-sm text-surface-500 py-3">
            {disabledReason ?? "Não é possível enviar mensagens neste ticket."}
          </p>
        ) : (
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              rows={2}
              placeholder="Digite sua mensagem... (Enter envia, Shift+Enter quebra linha)"
              className="flex-1 resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={sending || draft.trim().length === 0}
              className="shrink-0 flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Enviar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
