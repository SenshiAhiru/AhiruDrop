"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Upload,
  Save,
  Play,
  Pause,
  XCircle,
  Lock,
  Copy,
  Trash2,
  CalendarDays,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { formatDate, formatCurrency } from "@/lib/utils";

// Mock raffle data
const mockRaffle = {
  id: "r1",
  title: "iPhone 15 Pro Max 256GB",
  description:
    "Concorra a um iPhone 15 Pro Max 256GB novinho, lacrado na caixa com nota fiscal. Cor: Titanio Natural.",
  shortDescription: "iPhone 15 Pro Max 256GB Titanio Natural",
  pricePerNumber: "5",
  totalNumbers: "1000",
  minPerPurchase: "1",
  maxPerPurchase: "100",
  category: "electronics",
  prizeType: "product",
  regulation: "Regulamento da rifa...",
  scheduledDrawAt: "2026-04-30T20:00",
  isFeatured: true,
  status: "ACTIVE",
  createdAt: "2026-04-01",
  soldNumbers: 780,
  revenue: 3900,
};

const statusActions: Record<string, { label: string; icon: React.ElementType; variant: "default" | "accent" | "destructive" | "outline" }[]> = {
  ACTIVE: [
    { label: "Pausar", icon: Pause, variant: "outline" },
    { label: "Encerrar", icon: Lock, variant: "accent" },
    { label: "Cancelar", icon: XCircle, variant: "destructive" },
  ],
  DRAFT: [
    { label: "Ativar", icon: Play, variant: "default" },
    { label: "Cancelar", icon: XCircle, variant: "destructive" },
  ],
  PAUSED: [
    { label: "Ativar", icon: Play, variant: "default" },
    { label: "Encerrar", icon: Lock, variant: "accent" },
    { label: "Cancelar", icon: XCircle, variant: "destructive" },
  ],
  CLOSED: [],
  CANCELLED: [],
};

const statusVariant: Record<string, "success" | "warning" | "danger" | "outline" | "default"> = {
  ACTIVE: "success",
  DRAFT: "outline",
  PAUSED: "warning",
  CLOSED: "default",
  CANCELLED: "danger",
};

export default function EditRafflePage() {
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
    destructive?: boolean;
  }>({
    open: false,
    title: "",
    description: "",
    action: () => {},
  });

  const [form, setForm] = useState({
    title: mockRaffle.title,
    description: mockRaffle.description,
    shortDescription: mockRaffle.shortDescription,
    pricePerNumber: mockRaffle.pricePerNumber,
    totalNumbers: mockRaffle.totalNumbers,
    minPerPurchase: mockRaffle.minPerPurchase,
    maxPerPurchase: mockRaffle.maxPerPurchase,
    category: mockRaffle.category,
    prizeType: mockRaffle.prizeType,
    regulation: mockRaffle.regulation,
    scheduledDrawAt: mockRaffle.scheduledDrawAt,
    isFeatured: mockRaffle.isFeatured,
  });

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/admin/raffles/${params.raffleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch {
      // handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (label: string) => {
    setConfirmDialog({
      open: true,
      title: `${label} Rifa`,
      description: `Tem certeza que deseja ${label.toLowerCase()} esta rifa? Esta acao pode afetar pedidos em andamento.`,
      action: () => {
        // API call
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
      destructive: label === "Cancelar",
    });
  };

  const handleDelete = () => {
    setConfirmDialog({
      open: true,
      title: "Excluir Rifa",
      description:
        "Esta acao e irreversivel. Todos os dados da rifa, numeros e pedidos relacionados serao permanentemente removidos.",
      action: () => {
        router.push("/admin/raffles");
      },
      destructive: true,
    });
  };

  const handleDuplicate = () => {
    setConfirmDialog({
      open: true,
      title: "Duplicar Rifa",
      description: "Uma copia desta rifa sera criada como rascunho. Deseja continuar?",
      action: () => {
        router.push("/admin/raffles/new");
      },
    });
  };

  const actions = statusActions[mockRaffle.status] ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Rifa</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Badge variant={statusVariant[mockRaffle.status]}>{mockRaffle.status}</Badge>
            <span>Criada em {formatDate(mockRaffle.createdAt)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              size="sm"
              onClick={() => handleStatusChange(action.label)}
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <BarChart3 className="h-5 w-5 text-primary-600" />
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">Vendidos</p>
              <p className="text-lg font-bold">
                {mockRaffle.soldNumbers}/{mockRaffle.totalNumbers}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CalendarDays className="h-5 w-5 text-primary-600" />
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">Receita</p>
              <p className="text-lg font-bold">{formatCurrency(mockRaffle.revenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CalendarDays className="h-5 w-5 text-primary-600" />
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">Progresso</p>
              <p className="text-lg font-bold">
                {Math.round((mockRaffle.soldNumbers / Number(mockRaffle.totalNumbers)) * 100)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informacoes Basicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informacoes Basicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Titulo</label>
            <Input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Descricao</label>
            <Textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Descricao Curta</label>
            <Input
              value={form.shortDescription}
              onChange={(e) => updateField("shortDescription", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuracao */}
      <Card>
        <CardHeader>
          <CardTitle>Configuracao</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Preco por Numero (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={form.pricePerNumber}
                onChange={(e) => updateField("pricePerNumber", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Total de Numeros</label>
              <Input
                type="number"
                value={form.totalNumbers}
                onChange={(e) => updateField("totalNumbers", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Minimo por Compra</label>
              <Input
                type="number"
                value={form.minPerPurchase}
                onChange={(e) => updateField("minPerPurchase", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Maximo por Compra</label>
              <Input
                type="number"
                value={form.maxPerPurchase}
                onChange={(e) => updateField("maxPerPurchase", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Categoria</label>
              <Select value={form.category} onChange={(e) => updateField("category", e.target.value)}>
                <option value="">Selecione...</option>
                <option value="electronics">Eletronicos</option>
                <option value="vehicles">Veiculos</option>
                <option value="cash">Dinheiro</option>
                <option value="fashion">Moda</option>
                <option value="other">Outros</option>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tipo de Premio</label>
              <Select value={form.prizeType} onChange={(e) => updateField("prizeType", e.target.value)}>
                <option value="">Selecione...</option>
                <option value="product">Produto</option>
                <option value="cash">Dinheiro</option>
                <option value="experience">Experiencia</option>
                <option value="service">Servico</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Imagem */}
      <Card>
        <CardHeader>
          <CardTitle>Imagem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--muted)]/30 p-10 text-center transition-colors hover:border-primary-500/50">
            <Upload className="mb-3 h-10 w-10 text-[var(--muted-foreground)]" />
            <p className="text-sm font-medium">Arraste uma imagem ou clique para fazer upload</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">PNG, JPG ou WebP ate 5MB</p>
          </div>
        </CardContent>
      </Card>

      {/* Regulamento */}
      <Card>
        <CardHeader>
          <CardTitle>Regulamento</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={form.regulation}
            onChange={(e) => updateField("regulation", e.target.value)}
            rows={5}
          />
        </CardContent>
      </Card>

      {/* Agendamento */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Data do Sorteio</label>
            <Input
              type="datetime-local"
              value={form.scheduledDrawAt}
              onChange={(e) => updateField("scheduledDrawAt", e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => updateField("isFeatured", e.target.checked)}
              className="h-4 w-4 rounded border-[var(--input)] accent-primary-600"
            />
            Rifa em destaque
          </label>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <Copy className="h-4 w-4" />
            Duplicar Rifa
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Excluir Rifa
          </Button>
        </div>
        <Button isLoading={isSubmitting} onClick={handleSave}>
          <Save className="h-4 w-4" />
          Salvar Alteracoes
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}>
        <DialogClose onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))} />
        <DialogHeader>
          <DialogTitle>{confirmDialog.title}</DialogTitle>
          <DialogDescription>{confirmDialog.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
          >
            Cancelar
          </Button>
          <Button
            variant={confirmDialog.destructive ? "destructive" : "default"}
            onClick={confirmDialog.action}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
