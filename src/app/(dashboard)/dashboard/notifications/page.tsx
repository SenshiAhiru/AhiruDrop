"use client";

import { useState } from "react";
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
} from "lucide-react";

type NotificationType = "raffle" | "payment" | "order" | "system";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
}

// Empty until API is connected
const initialNotifications: Notification[] = [];

const typeConfig: Record<
  NotificationType,
  { icon: typeof Bell; color: string; bg: string }
> = {
  raffle: { icon: Trophy, color: "text-primary-400", bg: "bg-primary-500/10" },
  payment: { icon: CreditCard, color: "text-success", bg: "bg-success/10" },
  order: { icon: ShoppingCart, color: "text-accent-400", bg: "bg-accent-500/10" },
  system: { icon: Info, color: "text-[var(--muted-foreground)]", bg: "bg-[var(--muted)]" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Notificacoes</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            {unreadCount > 0
              ? `Voce tem ${unreadCount} notificacao${unreadCount > 1 ? "es" : ""} nao lida${unreadCount > 1 ? "s" : ""}`
              : "Todas as notificacoes foram lidas"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)]">
                <BellOff className="h-8 w-8 text-[var(--muted-foreground)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                Nenhuma notificacao
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] max-w-xs">
                Voce ainda nao tem notificacoes. Elas aparecerao aqui quando houver novidades.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const config = typeConfig[notification.type];
            const Icon = config.icon;

            return (
              <button
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className="w-full text-left"
              >
                <Card
                  className={`transition-all cursor-pointer hover:border-primary-500/30 ${
                    !notification.read
                      ? "border-primary-500/20 bg-primary-500/5"
                      : ""
                  }`}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ${config.bg}`}
                      >
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1.5 opacity-70">
                          {notification.timeAgo}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
