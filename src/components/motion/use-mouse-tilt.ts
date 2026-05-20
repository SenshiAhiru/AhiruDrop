"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseMouseTiltOptions {
  /** Max rotation on each axis, in degrees. Default 6. */
  maxTilt?: number;
  /** Perspective in px applied to the parent transform. Default 800. */
  perspective?: number;
  /** Subtle Y lift on hover (px). Default 4. */
  lift?: number;
}

/**
 * Subtle mouse-following tilt for cards / interactive panels.
 *
 * Returns `bind` (spread onto the element you want to tilt) and
 * `style` (apply on the same element). Tilt eases back to zero when
 * the cursor leaves; no animation framework needed.
 *
 *   const tilt = useMouseTilt();
 *   <div {...tilt.bind} style={tilt.style}>...</div>
 *
 * Respects prefers-reduced-motion — returns identity handlers + empty
 * style when the user has opted out.
 */
export function useMouseTilt({
  maxTilt = 6,
  perspective = 800,
  lift = 4,
}: UseMouseTiltOptions = {}) {
  const [reduced, setReduced] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, lifted: false });
  const elRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (reduced) return;
      const el = e.currentTarget;
      elRef.current = el;
      const rect = el.getBoundingClientRect();
      // Position from -1 to +1 across each axis
      const xNorm = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const yNorm = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      setTilt({
        x: -yNorm * maxTilt, // rotateX: vertical mouse moves => tilts forward/back
        y: xNorm * maxTilt,  // rotateY: horizontal mouse moves => tilts left/right
        lifted: true,
      });
    },
    [maxTilt, reduced]
  );

  const onMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0, lifted: false });
  }, []);

  if (reduced) {
    return {
      bind: {},
      style: {} as React.CSSProperties,
    };
  }

  const style: React.CSSProperties = {
    transform: `perspective(${perspective}px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${tilt.lifted ? -lift : 0}px)`,
    transition: tilt.lifted
      ? "transform 120ms ease-out"
      : "transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
    transformStyle: "preserve-3d",
    willChange: "transform",
  };

  return {
    bind: { onMouseMove, onMouseLeave },
    style,
  };
}
