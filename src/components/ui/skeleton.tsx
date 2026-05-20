import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * When true (default), renders the brand shimmer — a diagonal sweep
   * that picks up purple + gold mid-stroke. Set false for the plain
   * gray pulse if shimmer feels too lively for a given context.
   */
  brand?: boolean;
}

function Skeleton({ className, brand = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        brand
          ? "skeleton-brand rounded-lg"
          : "animate-pulse rounded-lg bg-[var(--muted)]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
