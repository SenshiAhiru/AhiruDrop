"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import {
  Save,
  Play,
  Pause,
  XCircle,
  Lock,
  Trash2,
  CalendarDays,
  BarChart3,
  Trophy,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
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
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatCurrency } from "@/lib/utils";

const statusActions: Record<string, { label: string; newStatus: string; icon: React.ElementType; variant: "default" | "accent" | "destructive" | "outline" }[]> = {
  ACTIVE: [
    { label: "Pausar", newStatus: "PAUSED", icon: Pause, variant: "outline" },
    { label: "Encerrar", newStatus: "CLOSED", icon: Lock, variant: "accent" },
    { label: "Cancelar", newStatus: "CANCELLED", icon: XCircle, variant: "destructive" },
  ],
  DRAFT: [
    { label: "Ativar", newStatus: "ACTIVE", icon: Play, variant: "default" },
    { label: "Cancelar", newStatus: "CANCELLED", icon: XCircle, variant: "destructive" },
  ],
  PAUSED: [
    { label: "Ativar", newStatus: "ACTIVE", icon: Play, variant: "default" },
    { label: "Encerrar", newStatus: "CLOSED", icon: Lock, variant: "accent" },
    { label: "Cancelar", newStatus: "CANCELLED", icon: XCircle, variant: "destructive" },
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
  const { addToast } = useToast();
  const params = useParams();
  const raffleId = params.raffleId as string;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [raffle, setRaffle] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
    title: "",
    description: "",
    shortDescription: "",
    pricePerNumber: "",
    totalNumbers: "",
    minPerPurchase: "",
    maxPerPurchase: "",
    regulation: "",
    scheduledDrawAt: "",
    isFeatured: false,
  });

  useEffect(() => {
    async function fetchRaffle() {
      try {
        const res = await fetch(`/api/admin/raffles/${raffleId}`);
        const json = await res.json();
        if (json.success && json.data) {
          const data = json.data;
          setRaffle(data);
          setForm({
            title: data.title || "",
            description: data.description || "",
            shortDescription: data.shortDescription || "",
            pricePerNumber: String(data.pricePerNumber || ""),
            totalNumbers: String(data.totalNumbers || ""),
            minPerPurchase: String(data.minPerPurchase || "1"),
            maxPerPurchase: String(data.maxPerPurchase || "100"),
            regulation: data.regulation || "",
            scheduledDrawAt: data.scheduledDrawAt ? data.scheduledDrawAt.slice(0, 16) : "",
            isFeatured: data.isFeatured || false,
          });
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Erro ao buscar rifa:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchRaffle();
  }, [raffleId]);

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/admin/raffles/${raffleId}`, {
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

  const handleStatusChange = (label: string, newStatus: string) => {
    const hasPaidTickets = stats.paid > 0;
    const isCancelling = newStatus === "CANCELLED";
    const refundWarning =
      isCancelling && hasPaidTickets
        ? `\n\n⚠️ ${stats.paid} número(s) vendido(s) serão reembolsados automaticamente e os usuários receberão uma notificação.`
        : "";

    setConfirmDialog({
      open: true,
      title: `${label} Rifa`,
      description: `Tem certeza que deseja ${label.toLowerCase()} esta rifa?${refundWarning}`,
      action: async () => {
        try {
          const res = await fetch(`/api/admin/raffles/${raffleId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          });
          const json = await res.json();
          if (json.success) {
            setRaffle((prev: any) => ({ ...prev, status: newStatus }));
          }
        } catch (err) {
          console.error("Erro ao alterar status:", err);
        }
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
      destructive: label === "Cancelar",
    });
  };

  const handleDelete = () => {
    const hasPaidTickets = stats.paid > 0;
    const refundWarning = hasPaidTickets
      ? `\n\n⚠️ ${stats.paid} número(s) vendido(s) serão reembolsados automaticamente antes da exclusão e os usuários notificados.`
      : "";

    setConfirmDialog({
      open: true,
      title: "Excluir Rifa",
      description: `Tem certeza que deseja excluir esta rifa permanentemente? Esta ação não pode ser desfeita.${refundWarning}`,
      action: async () => {
        setIsDeleting(true);
        try {
          const res = await fetch(`/api/admin/raffles/${raffleId}`, {
            method: "DELETE",
          });
          const json = await res.json();
          if (json.success) {
            addToast({ type: "success", message: "Rifa excluída" });
            router.push("/admin/raffles");
            return;
          }
          addToast({ type: "error", message: json.error || "Erro ao excluir rifa" });
        } catch {
          addToast({ type: "error", message: "Erro de conexão ao excluir rifa" });
        } finally {
          setIsDeleting(false);
        }
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
      destructive: true,
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (notFound || !raffle) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Rifa não encontrada</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          A rifa solicitada não existe ou foi removida.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => router.push("/admin/raffles")}>
          Voltar para Rifas
        </Button>
      </div>
    );
  }

  const stats = raffle.stats || { available: 0, reserved: 0, paid: 0, total: 0 };
  const revenue = stats.paid * Number(raffle.pricePerNumber || 0);
  const progress = stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0;
  const actions = statusActions[raffle.status] ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Rifa</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Badge variant={statusVariant[raffle.status] || "default"}>{raffle.status}</Badge>
            {raffle.createdAt && <span>Criada em {formatDate(raffle.createdAt)}</span>}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {raffle.slug && (
            <Link href={`/raffles/${raffle.slug}`} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
                Preview público
              </Button>
            </Link>
          )}
          {raffle.status === "CLOSED" && (
            <Link href={`/admin/raffles/${raffle.id}/draw`}>
              <Button variant="accent" size="sm">
                <Trophy className="h-4 w-4" />
                Realizar sorteio
              </Button>
            </Link>
          )}
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              size="sm"
              onClick={() => handleStatusChange(action.label, action.newStatus)}
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Skin Image & Info */}
      {raffle.skinImage && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <img
                src={raffle.skinImage}
                alt={raffle.title}
                className="h-32 w-auto rounded-lg object-contain"
              />
              <div className="flex flex-wrap gap-2">
                {raffle.skinRarity && (
                  <Badge
                    variant="outline"
                    style={raffle.skinRarityColor ? { borderColor: raffle.skinRarityColor, color: raffle.skinRarityColor } : undefined}
                  >
                    {raffle.skinRarity}
                  </Badge>
                )}
                {raffle.skinWear && <Badge variant="outline">{raffle.skinWear}</Badge>}
                {raffle.skinWeapon && <Badge variant="outline">{raffle.skinWeapon}</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <BarChart3 className="h-5 w-5 text-primary-600" />
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">Vendidos</p>
              <p className="text-lg font-bold">
                {stats.paid}/{stats.total}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CalendarDays className="h-5 w-5 text-primary-600" />
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">Receita</p>
              <p className="text-lg font-bold">{formatCurrency(revenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CalendarDays className="h-5 w-5 text-primary-600" />
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">Progresso</p>
              <p className="text-lg font-bold">{progress}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Título</label>
            <Input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Descrição</label>
            <Textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Descrição Curta</label>
            <Input
              value={form.shortDescription}
              onChange={(e) => updateField("shortDescription", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuração */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Preço por Número (AHC)</label>
              <Input
                type="number"
                step="0.01"
                value={form.pricePerNumber}
                onChange={(e) => updateField("pricePerNumber", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Total de Números</label>
              <Input
                type="number"
                value={form.totalNumbers}
                onChange={(e) => updateField("totalNumbers", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Mínimo por Compra</label>
              <Input
                type="number"
                value={form.minPerPurchase}
                onChange={(e) => updateField("minPerPurchase", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Máximo por Compra</label>
              <Input
                type="number"
                value={form.maxPerPurchase}
                onChange={(e) => updateField("maxPerPurchase", e.target.value)}
              />
            </div>
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
            <DateTimePicker
              value={form.scheduledDrawAt}
              onChange={(val) => updateField("scheduledDrawAt", val)}
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
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          isLoading={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
          Excluir Rifa
        </Button>
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
