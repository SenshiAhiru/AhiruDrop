"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus, Search, Tag, Loader2, Pencil, Trash2, Power, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/providers/confirm-provider";

type Coupon = {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: string | number;
  maxUses: number | null;
  maxUsesPerUser: number | null;
  currentUses: number;
  minOrderAmount: string | number | null;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
};

type FormState = {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: string;
  maxUses: string;
  maxUsesPerUser: string;
  minOrderAmount: string;
  validUntil: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  code: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  maxUses: "",
  maxUsesPerUser: "",
  minOrderAmount: "",
  validUntil: "",
  isActive: true,
};

export default function CouponsPage() {
  const { addToast } = useToast();
  const confirm = useConfirm();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (activeFilter !== "ALL") params.set("isActive", activeFilter === "ACTIVE" ? "true" : "false");
      params.set("page", String(page));
      params.set("limit", "50");
      const res = await fetch(`/api/admin/coupons?${params}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setCoupons(json.data.data);
        setPages(json.data.pages ?? 1);
        setTotal(json.data.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [search, activeFilter, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(c: Coupon) {
    setEditingId(c.id);
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: String(c.discountValue),
      maxUses: c.maxUses != null ? String(c.maxUses) : "",
      maxUsesPerUser: c.maxUsesPerUser != null ? String(c.maxUsesPerUser) : "",
      minOrderAmount: c.minOrderAmount != null ? String(c.minOrderAmount) : "",
      validUntil: c.validUntil ? c.validUntil.split("T")[0] : "",
      isActive: c.isActive,
    });
    setFormError(null);
    setFormOpen(true);
  }

  async function submitForm() {
    setFormError(null);
    const value = parseFloat(form.discountValue.replace(",", "."));
    if (!isFinite(value) || value <= 0) {
      setFormError("Valor de desconto inválido");
      return;
    }
    if (form.code.trim().length < 3) {
      setFormError("Código deve ter pelo menos 3 caracteres");
      return;
    }
    if (form.discountType === "PERCENTAGE" && value > 100) {
      setFormError("Desconto percentual máximo é 100");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        code: form.code.trim(),
        discountType: form.discountType,
        discountValue: value,
        isActive: form.isActive,
      };
      if (form.maxUses) payload.maxUses = parseInt(form.maxUses, 10);
      if (form.maxUsesPerUser) payload.maxUsesPerUser = parseInt(form.maxUsesPerUser, 10);
      if (form.minOrderAmount) payload.minOrderAmount = parseFloat(form.minOrderAmount.replace(",", "."));
      if (form.validUntil) payload.validUntil = new Date(form.validUntil).toISOString();

      const url = "/api/admin/coupons";
      const method = editingId ? "PATCH" : "POST";
      const body = editingId ? { id: editingId, ...payload } : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!json.success) {
        setFormError(json.error || "Falha ao salvar");
        return;
      }

      addToast({
        type: "success",
        message: editingId ? "Cupom atualizado" : "Cupom criado",
      });
      setFormOpen(false);
      await load();
    } catch {
      setFormError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c: Coupon) {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, isActive: !c.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        addToast({ type: "success", message: `Cupom ${!c.isActive ? "ativado" : "desativado"}` });
        await load();
      }
    } catch {
      addToast({ type: "error", message: "Erro de conexão" });
    }
  }

  async function deleteCoupon(c: Coupon) {
    const ok = await confirm({
      title: `Excluir cupom ${c.code}?`,
      description:
        c.currentUses > 0
          ? `Este cupom já foi usado ${c.currentUses} vez(es). Excluir pode afetar pedidos históricos.`
          : "Esta ação é irreversível.",
      confirmLabel: "Excluir",
      variant: "destructive",
    });
    if (!ok) return;

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id }),
      });
      const json = await res.json();
      if (json.success) {
        addToast({ type: "success", message: "Cupom excluído" });
        await load();
      } else {
        addToast({ type: "error", message: json.error || "Falha" });
      }
    } catch {
      addToast({ type: "error", message: "Erro de conexão" });
    }
  }

  function formatDiscount(c: Coupon) {
    const val = Number(c.discountValue);
    return c.discountType === "PERCENTAGE" ? `${val}%` : `${val.toFixed(2)} AHC`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cupons de Desconto</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {total} cupom{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Novo Cupom
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Buscar por código..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-40"
        >
          <option value="ALL">Todos</option>
          <option value="ACTIVE">Ativos</option>
          <option value="INACTIVE">Inativos</option>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--border)] py-16 text-[var(--muted-foreground)]">
          <Tag className="mb-3 h-12 w-12 opacity-40" />
          <p className="text-lg font-medium">Nenhum cupom cadastrado</p>
          <Button onClick={openCreate} className="mt-4">
            <Plus className="h-4 w-4" /> Criar primeiro cupom
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-surface-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-900/60 border-b border-surface-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Desconto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Usos</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Válido até</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800">
                {coupons.map((c) => {
                  const expired = c.validUntil && new Date(c.validUntil) < new Date();
                  const exhausted = c.maxUses != null && c.currentUses >= c.maxUses;
                  return (
                    <tr key={c.id} className="hover:bg-surface-900/40 transition-colors">
                      <td className="px-4 py-3">
                        <code className="font-mono font-bold text-primary-400">{c.code}</code>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="font-semibold text-accent-400">{formatDiscount(c)}</span>
                        {c.minOrderAmount && (
                          <span className="text-[10px] text-surface-500 block">
                            min. {Number(c.minOrderAmount).toFixed(2)} AHC
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={exhausted ? "text-red-400" : ""}>
                          {c.currentUses}
                          {c.maxUses != null ? ` / ${c.maxUses}` : " / ∞"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {c.validUntil ? (
                          <span className={expired ? "text-red-400" : "text-surface-300"}>
                            {formatDate(c.validUntil)}
                          </span>
                        ) : (
                          <span className="text-surface-500">sem limite</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {c.isActive && !expired && !exhausted ? (
                          <Badge variant="success">Ativo</Badge>
                        ) : expired ? (
                          <Badge variant="danger">Expirado</Badge>
                        ) : exhausted ? (
                          <Badge variant="danger">Esgotado</Badge>
                        ) : (
                          <Badge variant="default">Inativo</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title={c.isActive ? "Desativar" : "Ativar"}
                            onClick={() => toggleActive(c)}
                          >
                            <Power className={`h-4 w-4 ${c.isActive ? "text-emerald-400" : "text-surface-500"}`} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)} title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => deleteCoupon(c)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-surface-800 bg-surface-900/30">
              <p className="text-xs text-surface-400">Página {page} de {pages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogClose onClick={() => setFormOpen(false)} />
        <DialogHeader>
          <DialogTitle>{editingId ? "Editar cupom" : "Novo cupom"}</DialogTitle>
          <DialogDescription>
            Cupons reduzem o valor final de um pedido ao serem aplicados no checkout.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <label className="text-xs text-surface-400 mb-1 block">Código</label>
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="EX: BEMVINDO10"
              maxLength={40}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-surface-400 mb-1 block">Tipo</label>
              <Select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}
              >
                <option value="PERCENTAGE">Percentual (%)</option>
                <option value="FIXED">Valor fixo (AHC)</option>
              </Select>
            </div>
            <div>
              <label className="text-xs text-surface-400 mb-1 block">
                {form.discountType === "PERCENTAGE" ? "% de desconto" : "AHC de desconto"}
              </label>
              <Input
                type="number"
                step="0.01"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                placeholder={form.discountType === "PERCENTAGE" ? "10" : "5.00"}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-surface-400 mb-1 block">Limite total de usos (opcional)</label>
              <Input
                type="number"
                min="1"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                placeholder="Ilimitado"
              />
            </div>
            <div>
              <label className="text-xs text-surface-400 mb-1 block">Limite por usuário (opcional)</label>
              <Input
                type="number"
                min="1"
                value={form.maxUsesPerUser}
                onChange={(e) => setForm({ ...form, maxUsesPerUser: e.target.value })}
                placeholder="Sem limite por user"
              />
              <p className="text-[10px] text-surface-500 mt-1">
                Use <span className="font-mono text-accent-400">1</span> para cupom único por usuário
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs text-surface-400 mb-1 block">Valor mínimo (AHC)</label>
            <Input
              type="number"
              step="0.01"
              value={form.minOrderAmount}
              onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
              placeholder="Sem mínimo"
            />
          </div>

          <div>
            <label className="text-xs text-surface-400 mb-1 block">Válido até (opcional)</label>
            <Input
              type="date"
              value={form.validUntil}
              onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-surface-700 bg-surface-800 text-primary-500"
            />
            Cupom ativo
          </label>

          {formError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-sm text-red-400 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {formError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={submitForm} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {editingId ? "Salvar alterações" : "Criar cupom"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
