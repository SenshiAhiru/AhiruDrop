"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  CheckCheck,
  Trophy,
  CreditCard,
  ShoppingCart,
  Info,
  BellOff,
  MessageSquare,
  MessageCircle,
  Loader2,
  AlertTriangle,
  Clock,
  Coins,
  ExternalLink,
} from "lucide-react";
import { usePoll } from "@/hooks/use-poll";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/provider";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any> | null;
  readAt: string | null;
  createdAt: string;
};

const typeConfig: Record<
  string,
  { icon: typeof Bell; color: string; bg: string }
> = {
  WINNER_NOTIFICATION: { icon: Trophy, color: "text-accent-400", bg: "bg-accent-500/10" },
  RAFFLE_DRAWN: { icon: Trophy, color: "text-accent-400", bg: "bg-accent-500/10" },
  PAYMENT_RECEIVED: { icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ORDER_CONFIRMED: { icon: ShoppingCart, color: "text-primary-400", bg: "bg-primary-500/10" },
  TICKET_EXPIRED: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
  SUPPORT_NEW_TICKET: { icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-500/10" },
  SUPPORT_NEW_MESSAGE: { icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-500/10" },
  RAFFLE_READY_TO_DRAW: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
  BIG_DEPOSIT: { icon: Coins, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  SYSTEM: { icon: Info, color: "text-surface-400", bg: "bg-surface-800" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins} min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d atrás`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      const res = await fetch("/api/user/notifications?limit=50", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data.data);
      }
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Poll every 1.5s while tab is visible
  usePoll(() => load({ silent: true }), 1500);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  async function markAllRead() {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      await load({ silent: true });
    } finally {
      setMarkingAll(false);
    }
  }

  async function markOneRead(id: string) {
    // Optimistic
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    await fetch("/api/user/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{t("notifications.title")}</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            {unreadCount > 0
              ? `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}`
              : "Tudo lido!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={markingAll}>
            {markingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
            {t("notifications.markAllRead")}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-800">
                <BellOff className="h-8 w-8 text-surface-500" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                {t("notifications.empty")}
              </h3>
              <p className="text-sm text-surface-400 max-w-xs">
                Você ainda não tem notificações. Elas aparecerão aqui quando houver novidades.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const config = typeConfig[n.type] ?? typeConfig.SYSTEM;
            const Icon = config.icon;
            const link = (n.data?.link as string | undefined) ?? null;
            const isUnread = !n.readAt;

            const body = (
              <div className="flex items-start gap-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0", config.bg)}>
                  <Icon className={cn("h-5 w-5", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-[var(--foreground)]">{n.title}</p>
                    {isUnread && <span className="h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-surface-400 break-words">{n.message}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <p className="text-[10px] text-surface-500">{timeAgo(n.createdAt)}</p>
                    {link && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary-400">
                        Abrir <ExternalLink className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );

            const className = cn(
              "block rounded-xl border p-4 transition-all cursor-pointer hover:border-primary-500/40",
              isUnread
                ? "border-primary-500/30 bg-primary-500/5"
                : "border-surface-700 bg-surface-900/40"
            );

            return link ? (
              <Link
                key={n.id}
                href={link}
                onClick={() => isUnread && markOneRead(n.id)}
                className={className}
              >
                {body}
              </Link>
            ) : (
              <button
                key={n.id}
                type="button"
                onClick={() => isUnread && markOneRead(n.id)}
                className={cn("w-full text-left", className)}
              >
                {body}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
