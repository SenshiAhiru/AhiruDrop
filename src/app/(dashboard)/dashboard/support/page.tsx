"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Plus, Loader2, Clock, CheckCircle2, PlayCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { SUPPORT_CATEGORIES } from "@/constants/support";
import { useTranslation } from "@/i18n/provider";

type TicketListItem = {
  id: string;
  subject: string;
  category: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  unreadForUser: number;
  messages: { body: string; createdAt: string; senderRole: string }[];
};

const STATUS_META: Record<
  string,
  { label: string; color: string; icon: React.ElementType; badgeVariant: "default" | "warning" | "success" | "danger" }
> = {
  OPEN: { label: "Aberto", color: "text-yellow-400", icon: Clock, badgeVariant: "warning" },
  IN_PROGRESS: { label: "Em andamento", color: "text-blue-400", icon: PlayCircle, badgeVariant: "default" },
  RESOLVED: { label: "Resolvido", color: "text-emerald-400", icon: CheckCircle2, badgeVariant: "success" },
  CLOSED: { label: "Fechado", color: "text-surface-500", icon: XCircle, badgeVariant: "default" },
};

export default function UserSupportPage() {
  const { t: tr } = useTranslation();
  const { addToast } = useToast();
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOpen, setNewOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "duvida", message: "" });
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/support/tickets", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setTickets(json.data.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate() {
    setFormError(null);
    if (form.subject.trim().length < 3) {
      setFormError("Assunto muito curto (mínimo 3 caracteres)");
      return;
    }
    if (form.message.trim().length < 5) {
      setFormError("Mensagem muito curta (mínimo 5 caracteres)");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        setFormError(json.error || "Falha ao criar ticket");
        return;
      }
      addToast({ type: "success", message: "Ticket criado", description: "Responderemos em breve." });
      setNewOpen(false);
      setForm({ subject: "", category: "duvida", message: "" });
      load();
    } catch {
      setFormError("Erro de conexão");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary-400" />
            <h1 className="text-2xl font-bold text-[var(--foreground)]">{tr("supportList.title")}</h1>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {tr("supportList.subtitle")}
          </p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="h-4 w-4" /> {tr("supportList.newTicket")}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="h-10 w-10 mx-auto text-surface-600 mb-3" />
            <p className="text-surface-400 mb-4">{tr("supportList.empty")}</p>
            <Button onClick={() => setNewOpen(true)}>
              <Plus className="h-4 w-4" /> Abrir primeiro ticket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => {
            const meta = STATUS_META[t.status] ?? STATUS_META.OPEN;
            const Icon = meta.icon;
            const lastMsg = t.messages[0];
            const category = SUPPORT_CATEGORIES.find((c) => c.value === t.category);
            return (
              <Link
                key={t.id}
                href={`/dashboard/support/${t.id}`}
                className="block rounded-xl border border-surface-700 bg-surface-900/40 p-4 hover:border-primary-500/40 hover:bg-surface-900/70 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${meta.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <h3 className="font-semibold text-[var(--foreground)] truncate">{t.subject}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        {t.unreadForUser > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-red-500/20 border border-red-500/40 text-red-400 px-2 py-0.5">
                            {t.unreadForUser} nova{t.unreadForUser > 1 ? "s" : ""}
                          </span>
                        )}
                        <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-surface-500">
                      <span className="font-mono">#{t.id.slice(-8)}</span>
                      {category && <span>· {category.label}</span>}
                      <span>· atualizado em {new Date(t.updatedAt).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    {lastMsg && (
                      <p className="mt-2 text-sm text-surface-400 line-clamp-2">
                        <span className="font-semibold text-surface-300">
                          {lastMsg.senderRole === "ADMIN" ? "Suporte" : "Você"}:
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

      {/* New ticket dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogClose onClick={() => setNewOpen(false)} />
        <DialogHeader>
          <DialogTitle>Novo ticket de suporte</DialogTitle>
          <DialogDescription>
            Descreva sua dúvida ou problema. Respondemos em até 24 horas úteis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs text-surface-400 mb-1 block">Categoria</label>
            <Select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {SUPPORT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-xs text-surface-400 mb-1 block">Assunto</label>
            <Input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Resumo curto do problema"
              maxLength={200}
            />
          </div>

          <div>
            <label className="text-xs text-surface-400 mb-1 block">Mensagem</label>
            <Textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Descreva o problema em detalhes..."
              rows={5}
              maxLength={5000}
            />
            <p className="mt-1 text-[10px] text-surface-500">{form.message.length}/5000</p>
          </div>

          {formError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-sm text-red-400 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {formError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setNewOpen(false)} disabled={creating}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating && <Loader2 className="h-4 w-4 animate-spin" />}
            Abrir ticket
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
