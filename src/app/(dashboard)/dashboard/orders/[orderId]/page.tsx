"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Package,
} from "lucide-react";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);

  // TODO: Replace with real data fetching
  const order = null;

  if (!order) {
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

        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)]">
                <Package className="h-8 w-8 text-[var(--muted-foreground)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                Pedido nao encontrado
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] max-w-xs">
                O pedido que voce procura nao existe ou foi removido.
              </p>
              <Link href="/dashboard/orders">
                <Button variant="outline" className="mt-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para pedidos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
