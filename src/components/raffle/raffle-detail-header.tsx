import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getWearColor } from "@/constants/cs2";

type RaffleStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "DRAWN" | "CANCELLED";

interface RaffleDetailHeaderProps {
  raffle: {
    title: string;
    description: string | null;
    status: RaffleStatus;
    pricePerNumber: number;
    category: string | null;
    prizeType: string | null;
    skinRarity?: string;
    skinRarityColor?: string;
    skinWear?: string;
    skinWeapon?: string;
    skinStatTrak?: boolean;
    skinMarketPrice?: number | null;
  };
  className?: string;
}

const statusConfig: Record<RaffleStatus, { label: string; variant: "default" | "accent" | "success" | "warning" | "danger" }> = {
  DRAFT: { label: "Rascunho", variant: "outline" as const },
  ACTIVE: { label: "Ativa", variant: "success" },
  PAUSED: { label: "Pausada", variant: "warning" },
  DRAWN: { label: "Sorteada", variant: "accent" },
  CANCELLED: { label: "Cancelada", variant: "danger" },
};

export function RaffleDetailHeader({ raffle, className }: RaffleDetailHeaderProps) {
  const {
    title,
    description,
    status,
    pricePerNumber,
    category,
    prizeType,
    skinRarity,
    skinRarityColor,
    skinWear,
    skinWeapon,
    skinStatTrak,
    skinMarketPrice,
  } = raffle;
  const statusInfo = statusConfig[status] ?? statusConfig.ACTIVE;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Title + Status */}
      <div className="flex flex-wrap items-start gap-3">
        <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        <Badge variant={statusInfo.variant} className="mt-1 text-xs uppercase tracking-wider">
          {statusInfo.label}
        </Badge>
      </div>

      {/* Weapon subtitle */}
      {skinWeapon && (
        <p className="text-sm text-[var(--muted-foreground)]">{skinWeapon}</p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Skin rarity badge */}
        {skinRarity && skinRarityColor && (
          <Badge
            className="text-xs text-white"
            style={{ backgroundColor: skinRarityColor }}
          >
            {skinRarity}
          </Badge>
        )}

        {/* Skin wear badge */}
        {skinWear && (
          <Badge
            className="text-xs text-white"
            style={{ backgroundColor: getWearColor(skinWear) }}
          >
            {skinWear}
          </Badge>
        )}

        {/* StatTrak badge */}
        {skinStatTrak && (
          <Badge
            className="text-xs font-semibold text-white"
            style={{ backgroundColor: "#cf6a32" }}
          >
            StatTrak&trade;
          </Badge>
        )}

        {category && (
          <Badge variant="outline" className="text-xs">
            <svg
              className="mr-1 h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
            </svg>
            {category}
          </Badge>
        )}
        {prizeType && (
          <Badge variant="outline" className="text-xs">
            <svg
              className="mr-1 h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
              />
            </svg>
            {prizeType}
          </Badge>
        )}
      </div>

      {/* Market price */}
      {skinMarketPrice != null && skinMarketPrice > 0 && (
        <div className="rounded-xl border border-accent-500/20 bg-accent-500/5 px-5 py-3">
          <span className="text-sm text-[var(--muted-foreground)]">Valor de mercado: </span>
          <span className="text-xl font-bold text-accent-500">
            {formatCurrency(skinMarketPrice)}
          </span>
        </div>
      )}

      {/* Price highlight */}
      <div className="flex items-baseline gap-2 rounded-xl border border-accent-500/20 bg-accent-500/5 px-5 py-3">
        <span className="text-sm text-[var(--muted-foreground)]">Valor por cota:</span>
        <span className="text-3xl font-bold text-accent-500">
          {formatCurrency(pricePerNumber)}
        </span>
      </div>

      {/* Description */}
      {description && (
        <div
          className="prose prose-sm dark:prose-invert max-w-none text-[var(--muted-foreground)] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
    </div>
  );
}
