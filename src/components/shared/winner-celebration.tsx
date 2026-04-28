"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, X, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type UnseenWin = {
  id: string;
  numberWon: number;
  drawnAt: string;
  raffle: {
    id: string;
    title: string;
    slug: string;
    skinImage: string | null;
    skinName: string | null;
    skinRarity: string | null;
    skinRarityColor: string | null;
    skinWear: string | null;
    skinWeapon: string | null;
  } | null;
};

interface Props {
  win: UnseenWin;
  onClose: () => void;
}

// Generate confetti pieces with random positions, delays, colors, and rotations
function useConfettiPieces(count: number) {
  return useMemo(() => {
    const colors = [
      "#fbbf24", // gold
      "#f59e0b", // amber
      "#8b5cf6", // purple
      "#a78bfa", // purple-light
      "#ec4899", // pink
      "#10b981", // emerald
      "#3b82f6", // blue
      "#ffffff", // white
    ];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2.5 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 8,
      rotation: Math.random() * 360,
      shape: Math.random() > 0.5 ? "circle" : "rect",
    }));
  }, [count]);
}

export function WinnerCelebrationPopup({ win, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const confetti = useConfettiPieces(40);
  const rarityColor = win.raffle?.skinRarityColor ?? "#fbbf24";

  // Entrance animation
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((p) => (
          <span
            key={p.id}
            className="absolute confetti-piece"
            style={{
              left: `${p.left}%`,
              top: "-5%",
              width: p.shape === "circle" ? p.size : p.size * 0.6,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.shape === "circle" ? "50%" : "2px",
              transform: `rotate(${p.rotation}deg)`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        className={`relative z-10 w-full max-w-md transition-all duration-500 ${
          visible ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      >
        <div
          className="rounded-3xl border-2 overflow-hidden celebration-glow"
          style={{ borderColor: `${rarityColor}80` }}
        >
          {/* Top accent gradient */}
          <div
            className="h-2 w-full"
            style={{
              background: `linear-gradient(90deg, ${rarityColor}, #fbbf24, ${rarityColor})`,
            }}
          />

          <div className="bg-surface-950/95 backdrop-blur-xl p-6 sm:p-8 text-center">
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-surface-500 hover:text-white hover:bg-surface-800/50 transition-colors z-20"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Star animation */}
            <div className="mb-4 celebration-star inline-block">
              <div
                className="flex h-20 w-20 mx-auto items-center justify-center rounded-full"
                style={{
                  background: `radial-gradient(circle, ${rarityColor}30, transparent)`,
                }}
              >
                <Trophy className="h-10 w-10 text-amber-400" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl font-black celebration-gradient-text mb-2">
              PARABÉNS!
            </h2>
            <p className="text-surface-400 text-sm mb-6">
              Você foi sorteado e ganhou uma rifa!
            </p>

            {/* Skin image */}
            {win.raffle?.skinImage && (
              <div
                className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56 mb-6 rounded-2xl flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle, ${rarityColor}20, transparent 70%)`,
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl border opacity-40 celebration-glow"
                  style={{ borderColor: rarityColor }}
                />
                <Image
                  src={win.raffle.skinImage}
                  alt={win.raffle.title}
                  fill
                  sizes="224px"
                  className="object-contain p-4 drop-shadow-2xl"
                />
              </div>
            )}

            {/* Raffle info */}
            <div className="space-y-2 mb-6">
              {win.raffle?.skinWeapon && (
                <p className="text-xs text-surface-500 uppercase tracking-wider font-semibold">
                  {win.raffle.skinWeapon}
                </p>
              )}
              <h3 className="text-xl font-bold text-white">
                {win.raffle?.title ?? "Rifa"}
              </h3>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {win.raffle?.skinRarity && (
                  <Badge
                    className="border text-xs"
                    style={{
                      color: rarityColor,
                      borderColor: `${rarityColor}40`,
                      backgroundColor: `${rarityColor}15`,
                    }}
                  >
                    {win.raffle.skinRarity}
                  </Badge>
                )}
                {win.raffle?.skinWear && (
                  <Badge variant="default" className="text-xs">
                    {win.raffle.skinWear}
                  </Badge>
                )}
              </div>
            </div>

            {/* Winning number */}
            <div className="rounded-xl border border-accent-500/30 bg-accent-500/10 px-6 py-4 mb-6 inline-block">
              <p className="text-xs text-accent-400/70 uppercase tracking-wider mb-1">
                Número sorteado
              </p>
              <p className="text-4xl font-black font-mono text-accent-400">
                #{win.numberWon}
              </p>
              <p className="text-xs text-surface-500 mt-1">
                {new Date(win.drawnAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                href="/dashboard/winnings"
                onClick={handleClose}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-amber-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-accent-500/30 hover:shadow-accent-500/50 transition-shadow"
              >
                <Trophy className="h-4 w-4" />
                Ver minha vitória
              </Link>
              {win.raffle?.slug && (
                <Link
                  href={`/raffles/${win.raffle.slug}/verify`}
                  onClick={handleClose}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  Prova do sorteio
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
