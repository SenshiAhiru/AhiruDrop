"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Sparkles, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { useTranslation } from "@/i18n/provider";

type Deposit = {
  id: string;
  paymentIntentId: string;
  currency: string;
  amountPaid: number;
  ahcBase: number;
  ahcBonus: number;
  ahcTotal: number;
  couponCode: string | null;
  status: "PENDING" | "COMPLETED" | "FAILED";
  completedAt: string | null;
  createdAt: string;
};

const STATUS_VARIANT: Record<string, "warning" | "success" | "danger"> = {
  PENDING: "warning",
  COMPLETED: "success",
  FAILED: "danger",
};

// Status labels resolved inside component via t()

const CURRENCY_SYMBOL: Record<string, string> = {
  BRL: "R$",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export default function DepositsHistoryPage() {
  const { t } = useTranslation();
  const STATUS_LABEL: Record<string, string> = {
    PENDING: t("myDeposits.statusPending"),
    COMPLETED: t("myDeposits.statusCompleted"),
    FAILED: t("myDeposits.statusFailed"),
  };
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/deposits?page=${page}&limit=20`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setDeposits(json.data.data);
        setPages(json.data.pages);
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const totalDeposited = deposits.reduce(
    (acc, d) => acc + (d.status === "COMPLETED" ? d.amountPaid : 0),
    0
  );
  const totalAhcReceived = deposits.reduce(
    (acc, d) => acc + (d.status === "COMPLETED" ? d.ahcTotal : 0),
    0
  );
  const totalBonus = deposits.reduce(
    (acc, d) => acc + (d.status === "COMPLETED" ? d.ahcBonus : 0),
    0
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{t("myDeposits.title")}</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          {t("myDeposits.subtitle")}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">{t("myDeposits.totalPaid")}</p>
            <p className="text-2xl font-bold text-white">R$ {totalDeposited.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">{t("myDeposits.ahcReceived")}</p>
            <p className="text-2xl font-bold text-accent-400">{totalAhcReceived.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">{t("myDeposits.couponBonus")}</p>
            <p className="text-2xl font-bold text-emerald-400">+{totalBonus.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : deposits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <Wallet className="h-10 w-10 text-surface-600 mb-3" />
              <p className="text-surface-400 mb-4">{t("myDeposits.empty")}</p>
              <Link href="/dashboard/deposit">
                <Button>
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  {t("myDeposits.firstDeposit")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-surface-800">
              {deposits.map((d) => {
                const symbol = CURRENCY_SYMBOL[d.currency] || d.currency;
                return (
                  <div
                    key={d.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={STATUS_VARIANT[d.status]}>{STATUS_LABEL[d.status]}</Badge>
                        {d.couponCode && (
                          <Badge variant="accent" className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            {d.couponCode}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-surface-500">
                        {new Date(d.createdAt).toLocaleString("pt-BR")}
                      </p>
                      <p className="text-[10px] text-surface-600 font-mono truncate">
                        {d.paymentIntentId}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:gap-6 sm:text-right">
                      <div>
                        <p className="text-xs text-surface-500">{t("myDeposits.paid")}</p>
                        <p className="font-semibold text-white">
                          {symbol} {d.amountPaid.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-surface-500">{t("myDeposits.received")}</p>
                        <p className="font-bold text-accent-400">
                          {d.ahcTotal.toFixed(2)}
                          {d.ahcBonus > 0 && (
                            <span className="ml-1 text-xs text-emerald-400">
                              (+{d.ahcBonus.toFixed(2)})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <p className="text-xs text-surface-500">
            Página {page} de {pages}
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={page === pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
