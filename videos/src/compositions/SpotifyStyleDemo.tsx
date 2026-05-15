import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

/**
 * SpotifyStyleDemo · ~9s demo no estilo do reel "@spotifybrasil me contrata".
 *
 * 3 micro-cenas:
 *   0–90    KINETIC TYPE   "TODO DIA / NOVA RIFA" passando rápido
 *   90–180  3D CARD        Rifa AK-47 Phantom Disruptor inclinada em
 *                          perspectiva, neon magenta da raridade Classified
 *   180–270 OUTRO          Coin com bloom gigante + wordmark + tagline
 *
 * Técnicas usadas (todas CSS puro / Remotion, sem plugins):
 *   - Bloom via filter: drop-shadow() stacked 3-4×
 *   - 3D tilt via transform: perspective() rotateY()/rotateX()
 *   - Mask sweep no texto
 *   - Spring entries com Remotion's spring()
 *   - Radial gradients localizados pra emular "luz de palco"
 */

export const SPOTIFY_DEMO_DURATION = 270;

export const SpotifyStyleDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#07070a" }}>
      <Sequence name="01 · Kinetic Type" durationInFrames={90}>
        <KineticTypeScene />
      </Sequence>

      <Sequence name="02 · 3D Card" from={90} durationInFrames={90}>
        <ThreeDCardScene />
      </Sequence>

      <Sequence name="03 · Outro" from={180} durationInFrames={90}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};

/* ═════════════════════════ Scene 01 · Kinetic Type ═══════════════════════ */

const KineticTypeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Two-line type. Each line sweeps across with overshoot.
  // Line 1: "TODO DIA" — frames 0-30
  // Line 2: "NOVA RIFA" — frames 20-50
  // Both hold 50-75, then exit at 75-90
  const line1X = interpolate(frame, [0, 25, 65, 90], [width, 0, 0, -width], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2X = interpolate(frame, [15, 40, 65, 90], [width, 0, 0, -width], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Bottom glow breathes
  const glowIntensity = 0.7 + 0.3 * Math.sin((frame / 30) * 2);
  const glowOpacity = interpolate(frame, [0, 15, 75, 90], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Bottom radial glow — purple */}
      <div
        style={{
          position: "absolute",
          bottom: -height * 0.3,
          left: "50%",
          transform: "translateX(-50%)",
          width: width * 1.4,
          height: height * 0.7,
          background:
            "radial-gradient(ellipse, #7c3aed 0%, #7c3aedaa 25%, transparent 70%)",
          filter: `blur(60px) brightness(${glowIntensity})`,
          opacity: glowOpacity,
        }}
      />

      {/* Subtle film grain via stacked dots */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
          opacity: 0.5,
        }}
      />

      {/* Line 1 — TODO DIA */}
      <div
        style={{
          position: "absolute",
          top: "32%",
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: width * 0.18,
          fontWeight: 900,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          color: "white",
          fontFamily:
            "Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
          transform: `translateX(${line1X}px)`,
          textShadow: "0 4px 32px rgba(124, 58, 237, 0.6)",
        }}
      >
        TODO DIA
      </div>

      {/* Line 2 — NOVA RIFA (accent) */}
      <div
        style={{
          position: "absolute",
          top: "47%",
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: width * 0.18,
          fontWeight: 900,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          fontFamily:
            "Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
          transform: `translateX(${line2X}px)`,
          background: "linear-gradient(135deg, #fbbf24 0%, #b26bff 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 4px 32px rgba(251, 191, 36, 0.4))",
        }}
      >
        NOVA RIFA
      </div>
    </AbsoluteFill>
  );
};

/* ═════════════════════════ Scene 02 · 3D Card ════════════════════════════ */

const ThreeDCardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Card entry spring
  const entry = spring({ frame, fps, config: { damping: 14, stiffness: 90 } });
  const scale = interpolate(entry, [0, 1], [0.4, 1]);
  const opacity = entry;
  const tiltY = interpolate(entry, [0, 1], [-30, 12]);
  const tiltX = interpolate(entry, [0, 1], [15, 5]);
  const liftY = interpolate(entry, [0, 1], [200, 0]);

  // Idle subtle motion after settled
  const idleFrame = Math.max(0, frame - 40);
  const idleTilt = Math.sin((idleFrame / fps) * 0.8) * 2;
  const idleY = Math.sin((idleFrame / fps) * 1.1) * 6;

  // Chip pops in after card
  const chipSpring = spring({ frame: frame - 25, fps, config: { damping: 12 } });
  const chipScale = interpolate(chipSpring, [0, 1], [0.5, 1]);
  const chipOpacity = chipSpring;

  // Exit — card slides up + fades at frame 75-90
  const exitOpacity = interpolate(frame, [75, 88], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitY = interpolate(frame, [75, 88], [0, -80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const RARITY = "#d32ce6"; // Classified

  return (
    <AbsoluteFill
      style={{
        opacity: exitOpacity,
        perspective: width * 1.5,
        perspectiveOrigin: "50% 50%",
      }}
    >
      {/* Background spotlight on card */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: width * 1.3,
          height: width * 1.3,
          background: `radial-gradient(circle, ${RARITY}22 0%, transparent 60%)`,
          filter: "blur(40px)",
          opacity: opacity * 0.8,
        }}
      />

      {/* Floating chip "Participar →" — appears above card */}
      <div
        style={{
          position: "absolute",
          top: "16%",
          left: "50%",
          transform: `translateX(-50%) scale(${chipScale})`,
          opacity: chipOpacity,
          padding: `${width * 0.022}px ${width * 0.05}px`,
          background: "#18181b",
          border: `1.5px solid ${RARITY}66`,
          borderRadius: 999,
          color: "white",
          fontSize: width * 0.04,
          fontWeight: 700,
          fontFamily:
            "Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
          boxShadow: `0 8px 32px ${RARITY}40, 0 0 0 1px ${RARITY}22 inset`,
          display: "flex",
          alignItems: "center",
          gap: width * 0.02,
        }}
      >
        <span style={{ color: RARITY, fontSize: width * 0.03 }}>✕</span>
        Participar agora →
      </div>

      {/* The 3D-tilted card itself */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          width: width * 0.78,
          transform: `
            translateX(-50%)
            translateY(${liftY + idleY + exitY}px)
            rotateY(${tiltY + idleTilt}deg)
            rotateX(${tiltX}deg)
            scale(${scale})
          `,
          transformStyle: "preserve-3d",
          opacity,
        }}
      >
        <CardInner rarityColor={RARITY} />
      </div>
    </AbsoluteFill>
  );
};

const CardInner: React.FC<{ rarityColor: string }> = ({ rarityColor }) => {
  const { width } = useVideoConfig();
  const cardW = width * 0.78;

  return (
    <div
      style={{
        width: "100%",
        background: "#0f0f12",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: `
          0 0 0 1.5px ${rarityColor}88,
          0 0 40px ${rarityColor}44,
          0 0 100px ${rarityColor}22,
          0 30px 60px -10px #000000aa
        `,
        fontFamily:
          "Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Neon top accent line */}
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, transparent, ${rarityColor}, transparent)`,
        }}
      />

      {/* Skin showcase */}
      <div
        style={{
          height: cardW * 0.65,
          background: `radial-gradient(circle at center, ${rarityColor}25 0%, transparent 60%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* MW wear chip top-left */}
        <div
          style={{
            position: "absolute",
            top: cardW * 0.04,
            left: cardW * 0.04,
            padding: `${cardW * 0.015}px ${cardW * 0.035}px`,
            background: "#27272a",
            color: "#a1a1aa",
            fontSize: cardW * 0.035,
            fontWeight: 700,
            borderRadius: 6,
          }}
        >
          MW
        </div>
        {/* ATIVA pill top-right */}
        <div
          style={{
            position: "absolute",
            top: cardW * 0.04,
            right: cardW * 0.04,
            padding: `${cardW * 0.015}px ${cardW * 0.04}px`,
            background: "#10b981",
            color: "white",
            fontSize: cardW * 0.035,
            fontWeight: 700,
            borderRadius: 999,
            letterSpacing: "0.05em",
          }}
        >
          ATIVA
        </div>
        <Img
          src={staticFile("skins/phantom-disruptor.png")}
          style={{
            maxWidth: "85%",
            maxHeight: "85%",
            objectFit: "contain",
            filter: `drop-shadow(0 12px 40px ${rarityColor}88)`,
          }}
        />
      </div>

      {/* Body */}
      <div style={{ padding: cardW * 0.06 }}>
        <div
          style={{
            color: "white",
            fontSize: cardW * 0.07,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          AK-47 | Phantom Disruptor
        </div>
        <div
          style={{
            color: "#a1a1aa",
            fontSize: cardW * 0.04,
            fontWeight: 600,
            marginTop: 6,
            letterSpacing: "0.05em",
          }}
        >
          AK-47
        </div>

        <div
          style={{
            marginTop: cardW * 0.05,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                color: "#a1a1aa",
                fontSize: cardW * 0.035,
                letterSpacing: "0.1em",
                marginBottom: 4,
              }}
            >
              POR COTA
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: cardW * 0.015,
              }}
            >
              <span
                style={{
                  color: "#fbbf24",
                  fontSize: cardW * 0.09,
                  fontWeight: 900,
                  fontFamily: "'SF Mono', Menlo, monospace",
                  lineHeight: 1,
                }}
              >
                0.5
              </span>
              <span style={{ color: "#d97706", fontSize: cardW * 0.04, fontWeight: 700 }}>
                AHC
              </span>
            </div>
          </div>

          <div
            style={{
              padding: `${cardW * 0.025}px ${cardW * 0.06}px`,
              background: `${rarityColor}22`,
              border: `1px solid ${rarityColor}66`,
              color: rarityColor,
              fontSize: cardW * 0.04,
              fontWeight: 700,
              borderRadius: 8,
              letterSpacing: "0.05em",
            }}
          >
            Classified
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═════════════════════════ Scene 03 · Outro ══════════════════════════════ */

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // Coin spring entry
  const coinSpring = spring({ frame, fps, config: { damping: 13, stiffness: 100 } });
  const coinScale = interpolate(coinSpring, [0, 1], [0.2, 1]);
  const coinOpacity = coinSpring;

  // Massive glow expands behind coin
  const glowSpring = spring({ frame: frame - 5, fps, config: { damping: 20 } });
  const glowScale = interpolate(glowSpring, [0, 1], [0.3, 1.4]);
  const glowOpacity = interpolate(glowSpring, [0, 1], [0, 0.8]);

  // Glow breathes after settled
  const breathe = 1 + Math.sin((Math.max(0, frame - 30) / fps) * 1.5) * 0.05;

  // Wordmark fades in
  const wordmarkOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wordmarkY = interpolate(frame, [30, 50], [25, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline
  const taglineOpacity = interpolate(frame, [45, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Final fade
  const finalFade = interpolate(frame, [80, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: finalFade }}>
      {/* Huge glow halo */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${glowScale * breathe})`,
          width: width * 1.5,
          height: width * 1.5,
          background:
            "radial-gradient(circle, #fbbf2499 0%, #7c3aed66 30%, #7c3aed22 50%, transparent 75%)",
          filter: "blur(60px)",
          opacity: glowOpacity,
        }}
      />

      {/* Coin */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${coinScale})`,
          opacity: coinOpacity,
        }}
      >
        <Img
          src={staticFile("coin-icon.png")}
          style={{
            width: width * 0.42,
            height: width * 0.42,
            filter: `
              drop-shadow(0 0 30px rgba(251, 191, 36, 0.7))
              drop-shadow(0 0 80px rgba(251, 191, 36, 0.4))
              drop-shadow(0 0 140px rgba(124, 58, 237, 0.5))
            `,
          }}
        />
      </div>

      {/* Wordmark */}
      <div
        style={{
          position: "absolute",
          top: "62%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: wordmarkOpacity,
          transform: `translateY(${wordmarkY}px)`,
          fontSize: width * 0.13,
          fontWeight: 900,
          letterSpacing: "0.01em",
          fontFamily:
            "Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
          background: "linear-gradient(135deg, #b26bff 0%, #fbbf24 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 4px 24px rgba(124, 58, 237, 0.5))",
        }}
      >
        AhiruDrop
      </div>

      {/* Tagline */}
      <div
        style={{
          position: "absolute",
          top: "74%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: taglineOpacity,
          fontSize: width * 0.032,
          fontWeight: 700,
          letterSpacing: "0.45em",
          color: "#fbbf24",
          fontFamily:
            "Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        }}
      >
        RIFAS · SKINS · DIVERSÃO
      </div>

      {/* URL footer */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: taglineOpacity,
          fontSize: width * 0.035,
          fontWeight: 700,
          letterSpacing: "0.2em",
          color: "#71717a",
          fontFamily:
            "Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        }}
      >
        AHIRUDROP.VERCEL.APP
      </div>
    </AbsoluteFill>
  );
};
