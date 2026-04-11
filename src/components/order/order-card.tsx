"use client";

import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface OrderCardProps {
  order: {
    id: string;
    status: string;
    finalAmount: number;
    createdAt: string;
    items: {
      raffleTitle: string;
      quantity: number;
    }[];
  };
}

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "outline" }> = {
  PENDING: { label: "Pendente", variant: "warning" },
  CONFIRMED: { label: "Confirmado", variant: "success" },
  CANCELLED: { label: "Cancelado", variant: "danger" },
  EXPIRED: { label: "Expirado", variant: "outline" },
  REFUNDED: { label: "Reembolsado", variant: "outline" },
};

export function OrderCard({ order }: OrderCardProps) {
  const config = statusConfig[order.status] || { label: order.status, variant: "outline" as const };

  return (
    <Link
      href={`/dashboard/orders/${order.id}`}
      className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:shadow-md hover:border-primary-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-sm font-mono text-[var(--muted-foreground)]">
              #{order.id.slice(0, 8)}
            </p>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>

          <div className="space-y-1">
            {order.items.map((item, i) => (
              <p key={i} className="text-sm font-medium truncate">
                {item.raffleTitle}{" "}
                <span className="text-[var(--muted-foreground)]">
                  x{item.quantity}
                </span>
              </p>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-2">
            <p className="text-lg font-bold text-primary-500">
              {formatCurrency(order.finalAmount)}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 text-[var(--muted-foreground)] flex-shrink-0" />
      </div>
    </Link>
  );
}
