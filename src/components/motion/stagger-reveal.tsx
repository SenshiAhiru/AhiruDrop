"use client";

import { useEffect, useRef, useState, Children } from "react";

interface StaggerRevealProps {
  children: React.ReactNode;
  /** Delay between siblings in ms. Default 80. */
  stagger?: number;
  /** Initial delay before first child reveals. Default 0. */
  initialDelay?: number;
  /** Per-child animation duration in ms. Default 500. */
  duration?: number;
  /** Vertical translation (px) before reveal. Default 24. */
  translateY?: number;
  /** Re-trigger when scrolling out + back in. Default false (one-shot). */
  retrigger?: boolean;
  className?: string;
}

/**
 * Wraps a list of elements and reveals them with a stagger when the
 * container scrolls into view. Each child fades in + slides up.
 *
 * Use it on raffle card grids, winner lists, anywhere a list of
 * similar items lands at once.
 *
 *   <StaggerReveal stagger={100}>
 *     {raffles.map(r => <RaffleCard key={r.id} {...r} />)}
 *   </StaggerReveal>
 *
 * Respects `prefers-reduced-motion` — no anim, items just appear.
 */
export function StaggerReveal({
  children,
  stagger = 80,
  initialDelay = 0,
  duration = 500,
  translateY = 24,
  retrigger = false,
  className,
}: StaggerRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced) {
      setVisible(true);
      return;
    }
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (!retrigger) observer.disconnect();
          } else if (retrigger) {
            setVisible(false);
          }
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [retrigger, reduced]);

  // Wrap each child in its own div so the reveal transform doesn't
  // clobber any transform the child applies on itself (e.g. mouse tilt).
  // Trade-off: extra DOM element per item, but no style merge fragility.
  const wrappedChildren = Children.map(children, (child, i) => {
    const delay = initialDelay + i * stagger;
    const style: React.CSSProperties = {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : `translateY(${translateY}px)`,
      transition: reduced
        ? "none"
        : `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms,
           transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      willChange: "opacity, transform",
      // display:contents would skip the wrapper from layout, but it
      // also drops grid-item participation. Keep block-level.
    };

    return (
      <div key={i} style={style}>
        {child}
      </div>
    );
  });

  return (
    <div ref={containerRef} className={className}>
      {wrappedChildren}
    </div>
  );
}
