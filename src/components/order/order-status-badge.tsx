import { Badge } from "@/components/ui/badge";

const statusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "accent" | "outline" }> = {
  PENDING: { label: "Pendente", variant: "warning" },
  CONFIRMED: { label: "Confirmado", variant: "success" },
  CANCELLED: { label: "Cancelado", variant: "danger" },
  EXPIRED: { label: "Expirado", variant: "outline" },
  REFUNDED: { label: "Reembolsado", variant: "outline" },
  APPROVED: { label: "Aprovado", variant: "success" },
  REJECTED: { label: "Rejeitado", variant: "danger" },
  // Raffle statuses
  DRAFT: { label: "Rascunho", variant: "outline" },
  ACTIVE: { label: "Ativa", variant: "success" },
  PAUSED: { label: "Pausada", variant: "warning" },
  CLOSED: { label: "Encerrada", variant: "default" },
  DRAWN: { label: "Sorteada", variant: "accent" },
};

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusMap[status] || { label: status, variant: "outline" as const };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
