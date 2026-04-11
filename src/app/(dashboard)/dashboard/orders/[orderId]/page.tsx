"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  ArrowLeft,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Ban,
} from "lucide-react";

// Mock order detail
const mockOrder = {
  id: "ord_a1b2c3",
  status: "pending" as const,
  createdAt: "2026-04-10T14:30:00Z",
  items: [
    {
      raffleName: "iPhone 15 Pro Max",
      quantity: 5,
      pricePerCota: 5.0,
      subtotal: 25.0,
    },
  ],
  numbers: [12, 45, 78, 156, 203],
  payment: {
    method: "PIX",
    status: "pending" as const,
    date: null as string | null,
  },
  total: 25.0,
  timeline: [
    {
      event: "Pedido criado",
      date: "2026-04-10T14:30:00Z",
      completed: true,
    },
    {
      event: "Pagamento processado",
      date: null as string | null,
      completed: false,
    },
    {
      event: "Pedido confirmado",
      date: null as string | null,
      completed: false,
    },
  ],
};

const statusConfig = {
  pending: { label: "Pendente", variant: "warning" as const, icon: Clock },
  confirmed: { label: "Confirmado", variant: "success" as const, icon: CheckCircle },
  cancelled: { label: "Cancelado", variant: "danger" as const, icon: XCircle },
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const order = mockOrder;
  const statusInfo = statusConfig[order.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard/orders"
          className="flex items-center gap-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Pedidos
        </Link>
        <span className="text-[var(--muted-foreground)]">/</span>
        <span className="text-[var(--foreground)] font-medium font-mono">
          #{orderId.slice(-6)}
        </span>
      </div>

      {/* Status Header */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  order.status === "confirmed"
                    ? "bg-success/10"
                    : order.status === "pending"
                      ? "bg-warning/10"
                      : "bg-danger/10"
                }`}
              >
                <StatusIcon
                  className={`h-7 w-7 ${
                    order.status === "confirmed"
                      ? "text-success"
                      : order.status === "pending"
                        ? "text-warning"
                        : "text-danger"
                  }`}
                />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-[var(--foreground)]">
                    Pedido #{orderId.slice(-6)}
                  </h1>
                  <Badge variant={statusInfo.variant} className="text-sm px-3 py-1">
                    {statusInfo.label}
                  </Badge>
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  Criado em {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            {order.status === "pending" && (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button className="flex-1 sm:flex-none">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pagar
                </Button>
                <Button variant="outline" className="flex-1 sm:flex-none text-danger hover:text-danger">
                  <Ban className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items + Numbers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-3 pr-4 font-medium text-[var(--muted-foreground)]">
                        Rifa
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-[var(--muted-foreground)]">
                        Qtd
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-[var(--muted-foreground)]">
                        Preco/Cota
                      </th>
                      <th className="text-right py-3 pl-4 font-medium text-[var(--muted-foreground)]">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-3 pr-4 text-[var(--foreground)] font-medium">
                          {item.raffleName}
                        </td>
                        <td className="py-3 px-4 text-center text-[var(--foreground)]">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-4 text-right text-[var(--foreground)]">
                          R$ {item.pricePerCota.toFixed(2)}
                        </td>
                        <td className="py-3 pl-4 text-right text-[var(--foreground)] font-semibold">
                          R$ {item.subtotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="py-3 pr-4 text-right font-semibold text-[var(--foreground)]">
                        Total
                      </td>
                      <td className="py-3 pl-4 text-right text-lg font-bold text-primary-400">
                        R$ {order.total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Numbers Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-primary-400" />
                Numeros Adquiridos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {order.numbers.map((num) => (
                  <div
                    key={num}
                    className="flex h-10 w-14 items-center justify-center rounded-lg bg-primary-500/10 border border-primary-500/20 text-sm font-mono font-semibold text-primary-400"
                  >
                    {String(num).padStart(3, "0")}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Payment + Timeline */}
        <div className="space-y-6">
          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-accent-400" />
                Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">Metodo</span>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {order.payment.method}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">Status</span>
                <Badge variant={statusConfig[order.payment.status].variant}>
                  {statusConfig[order.payment.status].label}
                </Badge>
              </div>
              {order.payment.date && (
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">Data</span>
                  <span className="text-sm text-[var(--foreground)]">
                    {new Date(order.payment.date).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {order.timeline.map((step, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          step.completed
                            ? "bg-success/10 ring-1 ring-success/30"
                            : "bg-surface-800 ring-1 ring-surface-700"
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <Clock className="h-4 w-4 text-[var(--muted-foreground)]" />
                        )}
                      </div>
                      {idx < order.timeline.length - 1 && (
                        <div
                          className={`w-px h-8 ${
                            step.completed ? "bg-success/30" : "bg-surface-700"
                          }`}
                        />
                      )}
                    </div>
                    <div className="pb-6">
                      <p
                        className={`text-sm font-medium ${
                          step.completed
                            ? "text-[var(--foreground)]"
                            : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {step.event}
                      </p>
                      {step.date && (
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {new Date(step.date).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
