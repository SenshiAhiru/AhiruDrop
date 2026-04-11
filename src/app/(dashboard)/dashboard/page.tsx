"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Ticket, ShoppingCart, Clock, ArrowRight, Trophy } from "lucide-react";

// Mock data
const mockStats = {
  activeRaffles: 3,
  totalOrders: 12,
  pendingPayments: 2,
};

const mockRecentOrders = [
  {
    id: "ord_a1b2c3",
    raffleName: "iPhone 15 Pro Max",
    quantity: 5,
    total: 25.0,
    status: "confirmed" as const,
    date: "2026-04-10",
  },
  {
    id: "ord_d4e5f6",
    raffleName: "PlayStation 5",
    quantity: 10,
    total: 30.0,
    status: "pending" as const,
    date: "2026-04-09",
  },
  {
    id: "ord_g7h8i9",
    raffleName: "MacBook Air M3",
    quantity: 3,
    total: 45.0,
    status: "confirmed" as const,
    date: "2026-04-08",
  },
  {
    id: "ord_j0k1l2",
    raffleName: "Smart TV 65\"",
    quantity: 8,
    total: 40.0,
    status: "cancelled" as const,
    date: "2026-04-07",
  },
  {
    id: "ord_m3n4o5",
    raffleName: "AirPods Pro",
    quantity: 2,
    total: 10.0,
    status: "confirmed" as const,
    date: "2026-04-06",
  },
];

const mockActiveRaffles = [
  {
    id: "raf_001",
    name: "iPhone 15 Pro Max",
    imageUrl: "/placeholder.jpg",
    drawDate: "2026-04-20",
    myNumbers: [12, 45, 78, 156, 203],
    totalNumbers: 500,
    soldNumbers: 387,
  },
  {
    id: "raf_002",
    name: "PlayStation 5",
    imageUrl: "/placeholder.jpg",
    drawDate: "2026-04-25",
    myNumbers: [3, 89, 201, 34, 112, 450, 67, 299, 15, 88],
    totalNumbers: 1000,
    soldNumbers: 612,
  },
  {
    id: "raf_003",
    name: "MacBook Air M3",
    imageUrl: "/placeholder.jpg",
    drawDate: "2026-05-01",
    myNumbers: [22, 156, 489],
    totalNumbers: 800,
    soldNumbers: 244,
  },
];

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

  const firstName = session?.user?.name?.split(" ")[0] || "Usuario";

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Ola, {firstName}!
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
          value={mockStats.activeRaffles}
          color="text-primary-400"
          bgColor="bg-primary-500/10"
        />
        <StatsCard
          icon={<ShoppingCart className="h-5 w-5" />}
          label="Pedidos Realizados"
          value={mockStats.totalOrders}
          color="text-accent-400"
          bgColor="bg-accent-500/10"
        />
        <StatsCard
          icon={<Clock className="h-5 w-5" />}
          label="Pagamentos Pendentes"
          value={mockStats.pendingPayments}
          color="text-warning"
          bgColor="bg-warning/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Pedidos Recentes</CardTitle>
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockRecentOrders.map((order) => (
                <Link
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
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Raffles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Rifas Ativas</CardTitle>
            <Link
              href="/raffles"
              className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
            >
              Explorar <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockActiveRaffles.map((raffle) => {
                const progress = Math.round(
                  (raffle.soldNumbers / raffle.totalNumbers) * 100
                );
                return (
                  <div
                    key={raffle.id}
                    className="p-3 rounded-lg border border-[var(--border)] hover:border-primary-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10 flex-shrink-0">
                          <Trophy className="h-4 w-4 text-primary-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--foreground)] truncate">
                            {raffle.name}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Sorteio: {new Date(raffle.drawDate).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0 ml-2">
                        {raffle.myNumbers.length} cotas
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
                        <span>{progress}% vendido</span>
                        <span>{raffle.soldNumbers}/{raffle.totalNumbers}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-surface-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary-500 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
