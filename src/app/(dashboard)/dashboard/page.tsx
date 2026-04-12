"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Ticket, ShoppingCart, Clock, ArrowRight, Trophy, Package } from "lucide-react";

const statusConfig = {
  pending: { label: "Pendente", variant: "warning" as const },
  confirmed: { label: "Confirmado", variant: "success" as const },
  cancelled: { label: "Cancelado", variant: "danger" as const },
};

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  const firstName = session?.user?.name?.split(" ")[0] || "Usuário";

  // Real data will come from API
  const stats = {
    activeRaffles: 0,
    totalOrders: 0,
    pendingPayments: 0,
  };

  const recentOrders: {
    id: string;
    raffleName: string;
    quantity: number;
    total: number;
    status: "pending" | "confirmed" | "cancelled";
    date: string;
  }[] = [];

  const [activeRaffles, setActiveRaffles] = useState<{
    id: string;
    name: string;
    slug: string;
    skinImage: string;
    drawDate: string;
    totalNumbers: number;
    soldNumbers: number;
  }[]>([]);

  useEffect(() => {
    fetch("/api/raffles?limit=4")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.data) {
          setActiveRaffles(
            json.data.data.map((r: any) => ({
              id: r.id,
              name: r.title,
              slug: r.slug,
              skinImage: r.skinImage || r.featuredImage || "",
              drawDate: r.scheduledDrawAt || "",
              totalNumbers: r.totalNumbers,
              soldNumbers: r.stats?.paid || 0,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Olá, {firstName}!
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Acompanhe suas rifas e pedidos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          icon={<Ticket className="h-5 w-5" />}
          label="Rifas Participando"
          value={stats.activeRaffles}
          color="text-primary-400"
          bgColor="bg-primary-500/10"
        />
        <StatsCard
          icon={<ShoppingCart className="h-5 w-5" />}
          label="Pedidos Realizados"
          value={stats.totalOrders}
          color="text-accent-400"
          bgColor="bg-accent-500/10"
        />
        <StatsCard
          icon={<Clock className="h-5 w-5" />}
          label="Pagamentos Pendentes"
          value={stats.pendingPayments}
          color="text-warning"
          bgColor="bg-warning/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Pedidos Recentes</CardTitle>
            <a
              href="/dashboard/orders"
              className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </a>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <a
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--muted)] transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate group-hover:text-primary-400 transition-colors">
                        {order.raffleName}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {order.quantity} cotas &middot; {new Date(order.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                      <span className="text-sm font-semibold text-[var(--foreground)]">
                        R$ {order.total.toFixed(2)}
                      </span>
                      <Badge variant={statusConfig[order.status].variant}>
                        {statusConfig[order.status].label}
                      </Badge>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Package className="h-8 w-8 text-[var(--muted-foreground)] mb-2" />
                <p className="text-sm text-[var(--muted-foreground)]">
                  Você ainda não fez nenhum pedido
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Raffles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Rifas Ativas</CardTitle>
            <a
              href="/raffles"
              className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
            >
              Explorar <ArrowRight className="h-3 w-3" />
            </a>
          </CardHeader>
          <CardContent>
            {activeRaffles.length > 0 ? (
              <div className="space-y-3">
                {activeRaffles.map((raffle) => {
                  const progress = raffle.totalNumbers > 0 ? Math.round((raffle.soldNumbers / raffle.totalNumbers) * 100) : 0;
                  return (
                    <a
                      key={raffle.id}
                      href={`/raffles/${raffle.slug}`}
                      className="block p-3 rounded-lg border border-[var(--border)] hover:border-primary-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {raffle.skinImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={raffle.skinImage} alt="" className="h-10 w-10 rounded-lg bg-surface-800 object-contain flex-shrink-0" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10 flex-shrink-0">
                            <Trophy className="h-4 w-4 text-primary-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[var(--foreground)] truncate">{raffle.name}</p>
                          {raffle.drawDate && (
                            <p className="text-xs text-[var(--muted-foreground)]">
                              Sorteio: {new Date(raffle.drawDate).toLocaleDateString("pt-BR")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
                          <span>{progress}% vendido</span>
                          <span>{raffle.soldNumbers}/{raffle.totalNumbers}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-surface-800 overflow-hidden">
                          <div className="h-full rounded-full bg-primary-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Ticket className="h-8 w-8 text-[var(--muted-foreground)] mb-2" />
                <p className="text-sm text-[var(--muted-foreground)]">
                  Você não está participando de nenhuma rifa
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({
  icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColor} ${color}`}>
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
            <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-14 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
