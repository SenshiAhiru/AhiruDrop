import { cn, calculatePercentage } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface RaffleProgressBarProps {
  sold: number;
  total: number;
  className?: string;
}

export function RaffleProgressBar({ sold, total, className }: RaffleProgressBarProps) {
  const percentage = calculatePercentage(sold, total);

  const colorClass =
    percentage > 80
      ? "[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-green-400"
      : percentage > 50
        ? "[&>div]:bg-gradient-to-r [&>div]:from-accent-500 [&>div]:to-yellow-400"
        : "";

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--muted-foreground)]">
          <span className="font-semibold text-[var(--foreground)]">{percentage}%</span> vendido
        </span>
        <span className="text-[var(--muted-foreground)]">
          <span className="font-semibold text-[var(--foreground)]">{sold}</span>/{total} cotas
        </span>
      </div>
      <Progress value={percentage} className={cn("h-3", colorClass)} />
    </div>
  );
}
