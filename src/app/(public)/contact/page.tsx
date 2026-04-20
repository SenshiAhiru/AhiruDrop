"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { LogIn, MessageSquare, Loader2 } from "lucide-react";
import { SUPPORT_CATEGORIES } from "@/constants/support";
import { useTranslation } from "@/i18n/provider";

export default function ContactPage() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [category, setCategory] = useState("duvida");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    if (subject.trim().length < 3) {
      addToast({ type: "error", message: "Assunto muito curto (mínimo 3 caracteres)" });
      return;
    }
    if (message.trim().length < 5) {
      addToast({ type: "error", message: "Mensagem muito curta (mínimo 5 caracteres)" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), category, message: message.trim() }),
      });
      const json = await res.json();
      if (!json.success) {
        addToast({ type: "error", message: json.error || "Falha ao enviar" });
        return;
      }
      addToast({
        type: "success",
        message: "Ticket criado!",
        description: "Você será redirecionado para o chat.",
      });
      router.push(`/dashboard/support/${json.data.id}`);
    } catch {
      addToast({ type: "error", message: "Erro de conexão" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
          {t("contact.title")}
        </h1>
        <p className="mt-3 text-[var(--muted-foreground)]">
          {t("contact.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
        {/* Form OR login prompt */}
        <div className="lg:col-span-3">
          {status === "loading" ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : !session?.user ? (
            <div className="rounded-xl border border-primary-500/30 bg-primary-600/5 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-600/15">
                <LogIn className="h-7 w-7 text-primary-400" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">
                Entre para abrir um ticket
              </h2>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Pra acompanharmos o histórico da sua conversa com o suporte, você precisa
                estar logado. Depois de entrar você abre o ticket e pode acompanhar as
                respostas direto no seu painel.
              </p>
              <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent("/contact")}`}
                  className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg border border-primary-500/50 px-5 py-2.5 text-sm font-semibold text-primary-400 hover:bg-primary-600/10 transition-colors"
                >
                  Criar conta
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="rounded-lg border border-primary-500/20 bg-primary-600/5 p-3 text-xs text-surface-300 flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-primary-400 mt-0.5 flex-shrink-0" />
                <span>
                  Logado como <strong className="text-white">{session.user.name}</strong>. Depois
                  de enviar, você será redirecionado ao chat do ticket.
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Categoria</label>
                <Select value={category} onChange={(e) => setCategory(e.target.value)} required>
                  {SUPPORT_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">{t("contact.subject")}</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Resumo curto do problema"
                  maxLength={200}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">{t("contact.message")}</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Descreva sua dúvida ou problema em detalhes..."
                  className="min-h-[140px]"
                  maxLength={5000}
                  required
                />
                <p className="text-[10px] text-surface-500">{message.length}/5000</p>
              </div>

              <Button type="submit" size="lg" isLoading={loading} className="w-full sm:w-auto">
                {loading ? t("contact.sending") : t("contact.submit")}
              </Button>
            </form>
          )}

          {session?.user && (
            <div className="mt-5 text-sm text-surface-400">
              Acompanhe suas mensagens em{" "}
              <Link href="/dashboard/support" className="text-primary-400 hover:underline">
                Minha Conta → Suporte
              </Link>
              .
            </div>
          )}
        </div>

        {/* Contact info sidebar */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h3 className="text-lg font-bold text-[var(--foreground)]">Informações de Contato</h3>

            <div className="mt-5 space-y-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-600/10 text-primary-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">E-mail</p>
                  <a href="mailto:suporte@ahirudrop.com" className="text-sm text-primary-500 hover:underline break-all">
                    suporte@ahirudrop.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-600/10 text-primary-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">Horário de Atendimento</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Segunda a Sexta<br />
                    09:00 - 18:00 (Horário de Brasília)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-600/10 text-primary-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">Redes Sociais</p>
                  <div className="mt-1 flex items-center gap-3">
                    <a href="#" className="text-[var(--muted-foreground)] hover:text-primary-500 transition-colors" aria-label="Instagram">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                    </a>
                    <a href="#" className="text-[var(--muted-foreground)] hover:text-primary-500 transition-colors" aria-label="Twitter">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">
              Muitas perguntas já foram respondidas na nossa
            </p>
            <Link href="/faq" className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-500 hover:text-primary-400 transition-colors">
              Página de FAQ
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
