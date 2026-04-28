import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * AhiruCoin (AHC) icon — used wherever the platform displays the
 * currency. Wraps next/image so we get optimization + lazy loading
 * for free, and centralises the asset path so a future re-brand
 * (or @2x swap) is a one-line change.
 */
interface AhcCoinProps {
  /** Rendered size in pixels. Should match the surrounding text scale. */
  size?: number;
  className?: string;
  /**
   * Whether the icon is purely decorative (paired with visible "AHC"
   * label). Decorative icons get an empty alt; standalone ones get
   * "AHC" for screen readers.
   */
  decorative?: boolean;
  priority?: boolean;
}

export function AhcCoin({
  size = 20,
  className,
  decorative = false,
  priority = false,
}: AhcCoinProps) {
  return (
    <Image
      src="/ahc-coin.png"
      alt={decorative ? "" : "AHC"}
      width={size}
      height={size}
      priority={priority}
      className={cn("rounded-full", className)}
      // Tiny static asset — no need for responsive sizes
      sizes={`${size}px`}
    />
  );
}
