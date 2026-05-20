"use client";

import { useCallback, useState, useEffect, useRef } from "react";

interface SparkleBurstProps {
  /** Total number of particles per burst. Default 8. */
  count?: number;
  /** Max distance each particle travels (px). Default 28. */
  distance?: number;
  /** Colors cycled across particles. Default brand palette. */
  colors?: string[];
}

interface BurstParticle {
  id: number;
  dx: number;
  dy: number;
  size: number;
  color: string;
  delay: number;
}

interface Burst {
  id: number;
  x: number;
  y: number;
  particles: BurstParticle[];
}

const DEFAULT_COLORS = ["#fbbf24", "#a78bfa", "#b26bff", "#ffffff"];

let burstIdSeed = 0;
let particleIdSeed = 0;

/**
 * Fires a sparkle burst at a click point.
 *
 * Wraps the children in a relative container so coordinates are
 * tracked from the element's own bounding box. Use the returned
 * `fire(event)` to trigger a burst on demand (typically from an
 * onClick handler on a descendant).
 *
 *   const { wrapper, fire } = useSparkleBurst();
 *
 *   <div {...wrapper}>
 *     <button onClick={(e) => { fire(e); buyNumber(); }}>+</button>
 *   </div>
 *
 * Or use the convenience component below.
 */
export function useSparkleBurst({
  count = 8,
  distance = 28,
  colors = DEFAULT_COLORS,
}: SparkleBurstProps = {}) {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const fire = useCallback(
    (e: React.MouseEvent | { clientX: number; clientY: number }) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const particles: BurstParticle[] = [];
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const d = distance * (0.7 + Math.random() * 0.6);
        particles.push({
          id: ++particleIdSeed,
          dx: Math.cos(angle) * d,
          dy: Math.sin(angle) * d,
          size: 4 + Math.random() * 4,
          color: colors[i % colors.length],
          delay: Math.random() * 80,
        });
      }

      const burst: Burst = { id: ++burstIdSeed, x, y, particles };
      setBursts((prev) => [...prev, burst]);

      // Cleanup after animation finishes (600ms + max delay 80ms)
      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== burst.id));
      }, 750);
    },
    [count, distance, colors]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => setBursts([]);
  }, []);

  const wrapper = {
    ref: containerRef,
    style: { position: "relative" as const },
  };

  const overlay = (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "visible",
        zIndex: 50,
      }}
      aria-hidden="true"
    >
      {bursts.map((b) =>
        b.particles.map((p) => (
          <span
            key={`${b.id}-${p.id}`}
            className="sparkle-particle"
            style={
              {
                left: b.x,
                top: b.y,
                width: p.size,
                height: p.size,
                background: p.color,
                borderRadius: "50%",
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                "--dx": `${p.dx}px`,
                "--dy": `${p.dy}px`,
                "--delay": `${p.delay}ms`,
              } as React.CSSProperties
            }
          />
        ))
      )}
    </div>
  );

  return { wrapper, overlay, fire };
}
