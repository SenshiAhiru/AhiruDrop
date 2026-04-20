"use client";

import { cn } from "@/lib/utils";
import { useCountdown } from "@/hooks/use-countdown";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n/provider";

interface RaffleCountdownProps {
  targetDate: string | Date;
  label?: string;
  compact?: boolean;
  className?: string;
}

interface TimeBoxProps {
  value: string;
  unit: string;
  compact?: boolean;
}

function TimeBox({ value, unit, compact }: TimeBoxProps) {
  if (compact) {
    return (
      <span className="font-mono font-bold text-primary-500">
        {value}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600 text-xl font-bold text-white font-mono shadow-sm shadow-primary-600/25">
        {value}
      </div>
      <span className="mt-1 text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
        {unit}
      </span>
    </div>
  );
}

export function RaffleCountdown({
  targetDate,
  label,
  compact = false,
  className,
}: RaffleCountdownProps) {
  const { t } = useTranslation();
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);
  const labelText = label ?? t("countdown.endsIn");

  if (isExpired) {
    return (
      <Badge variant="danger" className={cn("text-xs", className)}>
        {t("countdown.expired")}
      </Badge>
    );
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]", className)}>
        <svg
          className="h-3.5 w-3.5 text-primary-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        <span>{labelText}</span>
        <span className="font-mono font-semibold text-[var(--foreground)]">
          {days !== "00" && <><TimeBox value={days} unit="d" compact />d </>}
          <TimeBox value={hours} unit="h" compact />:
          <TimeBox value={minutes} unit="m" compact />:
          <TimeBox value={seconds} unit="s" compact />
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-[var(--muted-foreground)]">{labelText}</p>
      <div className="flex items-center gap-2">
        <TimeBox value={days} unit={t("countdown.days")} />
        <span className="text-xl font-bold text-[var(--muted-foreground)] self-start mt-3">:</span>
        <TimeBox value={hours} unit={t("countdown.hours")} />
        <span className="text-xl font-bold text-[var(--muted-foreground)] self-start mt-3">:</span>
        <TimeBox value={minutes} unit={t("countdown.minutes")} />
        <span className="text-xl font-bold text-[var(--muted-foreground)] self-start mt-3">:</span>
        <TimeBox value={seconds} unit={t("countdown.seconds")} />
      </div>
    </div>
  );
}
