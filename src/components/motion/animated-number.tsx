"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  /** Duration in milliseconds. Default 800. */
  durationMs?: number;
  /** Decimal places to display. Default 2. */
  decimals?: number;
  /** Locale for number formatting. Default pt-BR. */
  locale?: string;
  className?: string;
  /** Add a brief scale/flash effect when value increases. Default true. */
  flashOnIncrease?: boolean;
}

/**
 * Number that animates between value changes using cubic ease-out.
 *
 * - On first render: shows the value immediately (no anim from 0).
 * - On subsequent changes: counts from the previous value to the new
 *   one over durationMs.
 * - When value INCREASES, briefly flashes brighter + scales (the
 *   "you just got money" feedback).
 *
 * Respects `prefers-reduced-motion` — no animation, just sets value.
 */
export function AnimatedNumber({
  value,
  durationMs = 800,
  decimals = 2,
  locale = "pt-BR",
  className,
  flashOnIncrease = true,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [flashing, setFlashing] = useState(false);
  const previousRef = useRef(value);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // First render — no animation
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousRef.current = value;
      setDisplayValue(value);
      return;
    }

    const from = previousRef.current;
    const to = value;
    if (from === to) return;

    previousRef.current = to;

    // Reduced motion → instant
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplayValue(to);
      return;
    }

    // Trigger flash on increase
    if (flashOnIncrease && to > from) {
      setFlashing(true);
      const flashTimer = setTimeout(() => setFlashing(false), 600);
      // Cleanup handled below via cancelAnimationFrame; flashTimer
      // cleanup is implicit (next change creates a new one)
      void flashTimer;
    }

    const start = performance.now();
    let rafId = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setDisplayValue(current);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setDisplayValue(to);
      }
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [value, durationMs, flashOnIncrease]);

  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        transition: "transform 250ms ease-out, color 250ms ease-out",
        transform: flashing ? "scale(1.1)" : "scale(1)",
        filter: flashing ? "brightness(1.3)" : "none",
        willChange: "transform",
      }}
    >
      {displayValue.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}
