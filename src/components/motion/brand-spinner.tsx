"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandSpinnerProps {
  /** Pixel size of the spinner (also the image render size). Default 32. */
  size?: number;
  className?: string;
  /** Optional caption shown below the spinner. */
  label?: string;
}

/**
 * Loading spinner with the AHC coin rotating + glow pulse.
 *
 * Drop-in replacement for the generic <Loader2 /> spinner in
 * contexts where the brand should be visible (deposit flow,
 * payment processing, withdrawal, raffle drawing, etc.).
 *
 * For tight UI spots (inline buttons, small icons) keep using
 * Loader2 from lucide — this is for the moments that benefit from
 * a more "premium" feel.
 *
 * Respects prefers-reduced-motion (CSS class auto-disables anim).
 */
export function BrandSpinner({ size = 32, className, label }: BrandSpinnerProps) {
  return (
    <div
      className={cn("inline-flex flex-col items-center justify-center gap-3", className)}
      role="status"
      aria-label={label ?? "Carregando"}
    >
      <Image
        src="/ahc-coin.png"
        alt=""
        width={size}
        height={size}
        className="animate-coin-spin rounded-full"
        aria-hidden="true"
        priority
      />
      {label && (
        <span className="text-xs font-medium text-[var(--muted-foreground)] tabular-nums">
          {label}
        </span>
      )}
    </div>
  );
}
