"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  /**
   * When true (default), the bar fills from 0 → value when the
   * component enters the viewport. Set false to skip the on-scroll
   * animation (useful for sticky/always-visible bars where the
   * effect would be jarring).
   */
  animateOnView?: boolean;
}

/**
 * Progress bar with brand gradient + scroll-triggered fill-in.
 *
 * - On first paint: width = 0
 * - When the bar scrolls into view: animates to the actual value
 *   over 800ms with cubic-bezier easing (the "satisfying fill")
 * - On subsequent value changes: animates smoothly via the same
 *   transition
 * - A subtle gold shimmer sweeps over the filled portion when the
 *   bar is settled and < 100%, signalling that the raffle is live
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, animateOnView = true, ...props }, ref) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    const [displayValue, setDisplayValue] = React.useState(
      animateOnView ? 0 : clampedValue
    );
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Combine forwarded ref with our local ref
    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    React.useEffect(() => {
      if (!animateOnView) {
        setDisplayValue(clampedValue);
        return;
      }
      const el = containerRef.current;
      if (!el) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        setDisplayValue(clampedValue);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              // Small delay so the user perceives the fill as a response
              // to their scroll, not as instant
              setTimeout(() => setDisplayValue(clampedValue), 80);
              observer.disconnect();
            }
          }
        },
        { threshold: 0.4 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }, [clampedValue, animateOnView]);

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full bg-surface-200 dark:bg-surface-800",
          className
        )}
        {...props}
      >
        <div
          className="relative h-full rounded-full bg-gradient-to-r from-primary-600 to-accent-500"
          style={{
            width: `${displayValue}%`,
            transition: "width 800ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Shimmer sweep — only visible when filled but not complete */}
          {displayValue > 0 && displayValue < 100 && (
            <div className="progress-shimmer absolute inset-0 rounded-full" />
          )}
        </div>
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
