"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/admin/data-table";
import { formatCurrency, formatDate } from "@/lib/utils";

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

const mockCoupons: Coupon[] = [
  {
    id: "c1",
    code: "AHIRU10",
    discountType: "PERCENTAGE",
    discountValue: 10,
    usesCount: 45,
    maxUses: 100,
    minOrderAmount: 20,
    validUntil: "2026-06-30",
    isActive: true,
  },
  {
    id: "c2",
    code: "BEMVINDO",
    discountType: "FIXED",
    discountValue: 5,
    usesCount: 120,
    maxUses: 200,
    minOrderAmount: 10,
    validUntil: "2026-12-31",
    isActive: true,
  },
  {
    id: "c3",
    code: "SUMMER25",
    discountType: "PERCENTAGE",
    discountValue: 25,
    usesCount: 50,
    maxUses: 50,
    minOrderAmount: 30,
    validUntil: "2026-03-31",
    isActive: false,
  },
];

type CouponRow = Coupon & Record<string, unknown>;

const emptyForm = {
  code: "",
  discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
  discountValue: 0,
  maxUses: 100,
  minOrderAmount: 0,
  validUntil: "",
  isActive: true,
};

export default function CouponsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [actionsOpen, setActionsOpen] = useState<string | null>(null);

  const filtered = mockCoupons.filter((c) => {
    if (search) {
      return c.code.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const columns: Column<CouponRow>[] = [
    {
      key: "code",
      label: "Codigo",
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
    {
      key: "actions",
      label: "Acoes",
      render: (item) => (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              setActionsOpen(
                actionsOpen === (item.id as string) ? null : (item.id as string)
              )
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {actionsOpen === (item.id as string) && (
            <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-[var(--border)] bg-[var(--card)] py-1 shadow-xl">
              <button className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--muted)]/50">
                <Pencil className="h-4 w-4" /> Editar
              </button>
              <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-[var(--muted)]/50">
                <Trash2 className="h-4 w-4" /> Excluir
              </button>
            </div>
          )}
        </div>
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
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>
              <X className="h-4 w-4" /> Cancelar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Novo Cupom
            </>
          )}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Criar Novo Cupom
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                  Codigo
                </label>
                <Input
                  placeholder="Ex: AHIRU20"
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  className="font-mono"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                  Tipo de Desconto
                </label>
                <Select
                  value={form.discountType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      discountType: e.target.value as "PERCENTAGE" | "FIXED",
                    })
                  }
                >
                  <option value="PERCENTAGE">Percentual (%)</option>
                  <option value="FIXED">Valor Fixo (R$)</option>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                  Valor do Desconto
                </label>
                <Input
                  type="number"
                  min={0}
                  value={form.discountValue || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      discountValue: Number(e.target.value),
                    })
                  }
                  placeholder={
                    form.discountType === "PERCENTAGE" ? "10" : "5.00"
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                  Maximo de Usos
                </label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxUses || ""}
                  onChange={(e) =>
                    setForm({ ...form, maxUses: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                  Pedido Minimo (R$)
                </label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.minOrderAmount || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      minOrderAmount: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                  Validade
                </label>
                <Input
                  type="date"
                  value={form.validUntil}
                  onChange={(e) =>
                    setForm({ ...form, validUntil: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded accent-primary-600"
                />
                Ativo
              </label>
              <div className="flex-1" />
              <Button
                variant="outline"
                onClick={() => {
                  setForm(emptyForm);
                  setShowForm(false);
                }}
              >
                Cancelar
              </Button>
              <Button>Criar Cupom</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <Input
          placeholder="Buscar por codigo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
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
    </div>
  );
}
