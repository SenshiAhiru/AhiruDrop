import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  Easing,
} from "remotion";

/**
 * SpotifyStyleDemo · ~9s demo no estilo do reel "@spotifybrasil me contrata".
 *
 * v2 polish: 60fps (de 30), easing curves customizadas, camera zoom sutil
 * na cena do card, crossfades entre cenas, drop-shadows consolidados.
 *
 * Timeline (em segundos, frames a 60fps):
 *   0.0–3.0   KINETIC TYPE   "TODO DIA / NOVA RIFA" sweep
 *   2.7–6.0   3D CARD        AK-47 Phantom Disruptor inclinado
 *   5.7–9.0   OUTRO          Coin + wordmark + tagline
 *
 *   ┌── crossfade 0.3s ──┐         ┌── crossfade 0.3s ──┐
 *   ░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░
 *
 * Técnicas (CSS / Remotion, sem plugins):
 *   - Bloom via filter: drop-shadow() stacked (consolidado, 2× máx)
 *   - 3D tilt via perspective() + rotateY/X
 *   - Easing.out(Easing.cubic) pra entries snappier
 *   - Spring physics calibrados por massa (card mais lento que chip)
 *   - Camera zoom Ken Burns sutil (1.0 → 1.06) no card pra dinamismo
 *   - Sequence overlap pra crossfade automático
 */

const FPS = 60;

// Cada cena dura 3 segundos = 180 frames a 60fps.
// Mas damos overlap de 18 frames (0.3s) entre cenas pra crossfade.
const SCENE_DURATION = 180;
const SCENE_OVERLAP = 18;

export const SPOTIFY_DEMO_DURATION = SCENE_DURATION * 3 - SCENE_OVERLAP * 2; // 540 - 36 = 504
export const SPOTIFY_DEMO_FPS = FPS;

export const SpotifyStyleDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#07070a" }}>
      <Sequence name="01 · Kinetic Type" durationInFrames={SCENE_DURATION}>
        <KineticTypeScene />
      </Sequence>

      <Sequence
        name="02 · 3D Card"
        from={SCENE_DURATION - SCENE_OVERLAP}
        durationInFrames={SCENE_DURATION}
      >
        <ThreeDCardScene />
      </Sequence>

      <Sequence
        name="03 · Outro"
        from={SCENE_DURATION * 2 - SCENE_OVERLAP * 2}
        durationInFrames={SCENE_DURATION}
      >
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};

// ────────────────── Shared easing curves ──────────────────
const easeOutCubic = Easing.out(Easing.cubic);
const easeOutExpo = Easing.out(Easing.exp);
const easeInOutCubic = Easing.inOut(Easing.cubic);

/**
 * Calcula opacidade pra fade in/out automático de cena.
 * - 12 frames de fade in
 * - 18 frames de fade out (cobre o overlap pro crossfade)
 */
function useSceneFade() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 18, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeInOutCubic,
    }
  );
  return Math.min(fadeIn, fadeOut);
}

/* ═════════════════════════ Scene 01 · Kinetic Type ═══════════════════════ */

const KineticTypeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const sceneOpacity = useSceneFade();

  // Frames recalibradas pra 60fps. Sweep mais rápido + easing forte.
  // Line 1 "TODO DIA": entra 0–50, hold 50–130, sai 130–160
  const line1X = interpolate(
    frame,
    [0, 40, 130, 160],
    [width * 1.2, 0, 0, -width * 1.2],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOutExpo,
    }
  );

  // Line 2 "NOVA RIFA": delay maior, mesmo padrão
  const line2X = interpolate(
    frame,
    [25, 70, 130, 160],
    [width * 1.2, 0, 0, -width * 1.2],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOutExpo,
    }
  );

  // Pulse do glow no rodapé (mais suave a 60fps)
  const glowIntensity = 0.7 + 0.25 * Math.sin((frame / FPS) * 1.5);
  const glowOpacity = interpolate(frame, [0, 20, 145, 180], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOutCubic,
  });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      {/* Bottom radial glow — purple, breathing */}
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

      {/* Subtle grain */}
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
          willChange: "transform",
        }}
      >
        TODO DIA
      </div>

      {/* Line 2 — NOVA RIFA */}
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
          willChange: "transform",
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
  const { width, height } = useVideoConfig();
  const sceneOpacity = useSceneFade();

  // Card entry spring — mais "pesado" (damping menor, stiffness menor)
  const entry = spring({
    frame,
    fps: FPS,
    config: { damping: 16, stiffness: 80, mass: 1.1 },
  });
  const scale = interpolate(entry, [0, 1], [0.4, 1]);
  const opacity = entry;
  const tiltY = interpolate(entry, [0, 1], [-30, 12]);
  const tiltX = interpolate(entry, [0, 1], [15, 5]);
  const liftY = interpolate(entry, [0, 1], [200, 0]);

  // Idle motion contínuo, suavizado a 60fps
  const idleFrame = Math.max(0, frame - 60);
  const idleTilt = Math.sin((idleFrame / FPS) * 0.9) * 2.2;
  const idleY = Math.sin((idleFrame / FPS) * 1.2) * 6;

  // Ken Burns zoom: camera "aproxima" sutilmente durante o hold
  const kenBurns = interpolate(frame, [40, 150], [1.0, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOutCubic,
  });

  // Chip pop-in com easing
  const chipSpring = spring({
    frame: frame - 35,
    fps: FPS,
    config: { damping: 13, stiffness: 130 },
  });
  const chipScale = interpolate(chipSpring, [0, 1], [0.5, 1]);
  const chipOpacity = chipSpring;

  // Exit do card no final da cena (cobre o crossfade)
  const exitOpacity = interpolate(frame, [SCENE_DURATION - 30, SCENE_DURATION - 5], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOutCubic,
  });
  const exitY = interpolate(frame, [SCENE_DURATION - 30, SCENE_DURATION - 5], [0, -60], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });

  const RARITY = "#d32ce6";

  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(sceneOpacity, exitOpacity),
        perspective: width * 1.5,
        perspectiveOrigin: "50% 50%",
      }}
    >
      {/* Spotlight on card */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${kenBurns})`,
          width: width * 1.3,
          height: width * 1.3,
          background: `radial-gradient(circle, ${RARITY}22 0%, transparent 60%)`,
          filter: "blur(40px)",
          opacity: opacity * 0.8,
        }}
      />

      {/* Floating chip */}
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
          willChange: "transform",
        }}
      >
        <span style={{ color: RARITY, fontSize: width * 0.03 }}>✕</span>
        Participar agora →
      </div>

      {/* The 3D card */}
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
            scale(${scale * kenBurns})
          `,
          transformStyle: "preserve-3d",
          opacity,
          willChange: "transform",
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
        // Sombra consolidada — 2 layers em vez de 4
        boxShadow: `
          0 0 0 1.5px ${rarityColor}88,
          0 0 60px ${rarityColor}33,
          0 30px 60px -10px #000000aa
        `,
        fontFamily:
          "Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, transparent, ${rarityColor}, transparent)`,
        }}
      />

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
            // Consolidado em 1 drop-shadow
            filter: `drop-shadow(0 12px 40px ${rarityColor}88)`,
          }}
        />
      </div>

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
            <div style={{ display: "flex", alignItems: "baseline", gap: cardW * 0.015 }}>
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
  const { width } = useVideoConfig();
  const sceneOpacity = useSceneFade();

  // Coin spring entry calibrado pra 60fps (config maior)
  const coinSpring = spring({
    frame,
    fps: FPS,
    config: { damping: 15, stiffness: 90 },
  });
  const coinScale = interpolate(coinSpring, [0, 1], [0.2, 1]);
  const coinOpacity = coinSpring;

  // Glow halo expande
  const glowSpring = spring({
    frame: frame - 10,
    fps: FPS,
    config: { damping: 22, stiffness: 70 },
  });
  const glowScale = interpolate(glowSpring, [0, 1], [0.3, 1.4]);
  const glowOpacity = interpolate(glowSpring, [0, 1], [0, 0.8]);

  // Breathing depois que assenta — mais sutil a 60fps
  const breathe = 1 + Math.sin((Math.max(0, frame - 60) / FPS) * 1.3) * 0.04;

  // Wordmark
  const wordmarkOpacity = interpolate(frame, [55, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });
  const wordmarkY = interpolate(frame, [55, 90], [25, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });

  // Tagline
  const taglineOpacity = interpolate(frame, [85, 115], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
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
          willChange: "transform",
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
          willChange: "transform",
        }}
      >
        <Img
          src={staticFile("coin-icon.png")}
          style={{
            width: width * 0.42,
            height: width * 0.42,
            // Consolidado: 2 shadows em vez de 3 (perda visual mínima)
            filter: `
              drop-shadow(0 0 60px rgba(251, 191, 36, 0.65))
              drop-shadow(0 0 140px rgba(124, 58, 237, 0.4))
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
