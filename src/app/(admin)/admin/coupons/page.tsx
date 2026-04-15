"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/data-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  usesCount: number;
  maxUses: number;
  minOrderAmount: number;
  validUntil: string;
  isActive: boolean;
}

const coupons: Coupon[] = [];

type CouponRow = Coupon & Record<string, unknown>;

export default function CouponsPage() {
  const { addToast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = coupons.filter((c) => {
    if (search) {
      return c.code.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const columns: Column<CouponRow>[] = [
    {
      key: "code",
      label: "Código",
      render: (item) => (
        <span className="font-mono font-semibold text-primary-600">
          {item.code as string}
        </span>
      ),
    },
    {
      key: "discountType",
      label: "Tipo",
      render: (item) => (
        <Badge variant="outline">
          {(item.discountType as string) === "PERCENTAGE"
            ? "Percentual"
            : "Fixo"}
        </Badge>
      ),
    },
    {
      key: "discountValue",
      label: "Valor",
      render: (item) =>
        (item.discountType as string) === "PERCENTAGE"
          ? `${item.discountValue}%`
          : formatCurrency(item.discountValue as number),
    },
    {
      key: "usesCount",
      label: "Usos",
      render: (item) => (
        <span>
          {item.usesCount as number}/{item.maxUses as number}
        </span>
      ),
    },
    {
      key: "validUntil",
      label: "Validade",
      render: (item) => formatDate(item.validUntil as string),
    },
    {
      key: "isActive",
      label: "Status",
      render: (item) => (
        <Badge variant={(item.isActive as boolean) ? "success" : "outline"}>
          {(item.isActive as boolean) ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Cupons de Desconto
        </h1>
        <Button onClick={() => addToast({ type: "info", message: "Em desenvolvimento", description: "Novos cupons poderão ser criados em breve." })}>
          <Plus className="h-4 w-4" /> Novo Cupom
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <Input
          placeholder="Buscar por código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table or Empty State */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--border)] py-16 text-[var(--muted-foreground)]">
          <Tag className="mb-3 h-12 w-12 opacity-40" />
          <p className="text-lg font-medium">Nenhum cupom criado</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered as unknown as CouponRow[]}
          pagination={{
            page,
            pages: Math.max(1, Math.ceil(filtered.length / 10)),
            total: filtered.length,
            onPageChange: setPage,
          }}
        />
      )}
    </div>
  );
}
