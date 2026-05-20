"use client";

import { useEffect, useRef } from "react";

interface HeroParticlesProps {
  /** Número de partículas (default 30 desktop, auto-reduz em mobile). */
  count?: number;
  className?: string;
}

/**
 * Campo de partículas flutuantes pra hero da home.
 *
 * Renderiza num <canvas> overlaid sobre o background. Cada partícula
 * tem cor da paleta (roxo/dourado), tamanho aleatório, twinkle opacity,
 * e drift suave. Cor mistura primary-400 + accent-400 do brand.
 *
 * Respeita `prefers-reduced-motion` — usuário com a config reduz
 * partículas pra 0 (componente vira no-op).
 *
 * Performance: ~60fps em qualquer dispositivo. Canvas é redimensionado
 * a cada resize. Loop pausa via cleanup quando componente desmonta.
 */
export function HeroParticles({ count = 30, className }: HeroParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Respeita preferência do usuário
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Em mobile reduz a quantidade automaticamente
    const isMobile = window.innerWidth < 768;
    const finalCount = isMobile ? Math.floor(count * 0.6) : count;

    const colors = [
      { r: 167, g: 139, b: 250 }, // primary-400 #a78bfa
      { r: 178, g: 107, b: 255 }, // purple-secondary #b26bff
      { r: 251, g: 191, b: 36 },  // accent-400 #fbbf24
    ];

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      color: { r: number; g: number; b: number };
      baseAlpha: number;
      twinklePhase: number;
      twinkleFreq: number;
    };

    let particles: Particle[] = [];

    function resize() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx?.scale(dpr, dpr);
    }
    resize();

    // Spawn
    for (let i = 0; i < finalCount; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25 - 0.05,
        r: Math.random() * 2.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: Math.random() * 0.4 + 0.2,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleFreq: 0.6 + Math.random() * 0.8,
      });
    }

    let rafId = 0;
    let startTime = performance.now();

    function tick(now: number) {
      if (!ctx || !canvas) return;
      const t = (now - startTime) / 1000;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        // Drift + wrap
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Twinkle (oscila entre 50% e 100% da baseAlpha)
        const twinkle = (Math.sin(t * p.twinkleFreq + p.twinklePhase) + 1) / 2;
        const alpha = p.baseAlpha * (0.5 + 0.5 * twinkle);

        // Glow halo (mais largo, mais transparente)
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        grad.addColorStop(0, `rgba(${p.color.r},${p.color.g},${p.color.b},${alpha})`);
        grad.addColorStop(1, `rgba(${p.color.r},${p.color.g},${p.color.b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    const onResize = () => {
      resize();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      particles = [];
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}
