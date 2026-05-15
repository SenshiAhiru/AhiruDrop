import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  random,
} from "remotion";
import { SceneWrapper } from "../components/SceneWrapper";

const DURATION = 90; // 3s
export const sceneWinDuration = DURATION;

export type SceneWinProps = { transparentBackground?: boolean };

const CONFETTI_COUNT = 50;
const CONFETTI_COLORS = ["#fbbf24", "#f59e0b", "#7c3aed", "#a78bfa", "#b26bff", "#ffffff"];

// Skin "ganha" no closing do video.
//
// COMO USAR IMAGEM REAL:
//   1. Salva o PNG em videos/public/skins/<arquivo>.png
//   2. Troca WINNER_SKIN_SRC abaixo de null → "skins/<arquivo>.png"
//
// Enquanto for null, usa o emoji como placeholder.
const WINNER_SKIN_SRC: string | null = "skins/phantom-disruptor.png"; // → "skins/phantom-disruptor.png"
const WINNER_SKIN_EMOJI = "🔫";
const WINNER_SKIN_NAME = "AK-47 | Phantom Disruptor";

/**
 * Cena 5 · WIN (0:12–0:15)
 *
 * Vencedor + skin reveal + confete + CTA "ahirudrop.vercel.app".
 * Encerramento épico do showcase.
 */
export const SceneWin: React.FC<SceneWinProps> = ({ transparentBackground = false }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Trophy springs in
  const trophySpring = spring({ frame, fps, config: { damping: 11, stiffness: 100 } });
  const trophyScale = interpolate(trophySpring, [0, 1], [0.3, 1]);

  // Trophy idle bounce after spring
  const trophyBounce = Math.sin((Math.max(0, frame - 20) / fps) * 4) * 8;

  // PARABÉNS text
  const titleOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [15, 35], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Skin emoji
  const skinSpring = spring({ frame: frame - 30, fps, config: { damping: 14 } });
  const skinScale = interpolate(skinSpring, [0, 1], [0.5, 1]);
  const skinOpacity = skinSpring;

  // CTA
  const ctaOpacity = interpolate(frame, [55, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaY = interpolate(frame, [55, 75], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneWrapper durationInFrames={DURATION}>
      {!transparentBackground && (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, #2e1065 0%, #0a0a0a 70%)",
          }}
        />
      )}

      {/* Confetti */}
      {Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
        const startFrame = Math.floor(random(`cs-${i}`) * 30);
        const localFrame = Math.max(0, frame - startFrame);
        const startX = random(`x-${i}`) * width;
        const fallProgress = (localFrame / fps) * 250; // 250 px/sec
        const wobble = Math.sin((localFrame / fps) * 3 + random(`w-${i}`) * Math.PI * 2) * 30;
        const rotate = (localFrame / fps) * 360 * (random(`r-${i}`) - 0.5) * 2;
        const color = CONFETTI_COLORS[Math.floor(random(`col-${i}`) * CONFETTI_COLORS.length)];
        const size = 6 + random(`s-${i}`) * 8;
        const opacity = interpolate(localFrame, [0, 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: startX + wobble,
              top: -20 + fallProgress,
              width: size,
              height: size * (random(`h-${i}`) > 0.5 ? 1 : 0.4),
              background: color,
              borderRadius: random(`br-${i}`) > 0.5 ? "50%" : 2,
              opacity,
              transform: `rotate(${rotate}deg)`,
              boxShadow: `0 0 ${size}px ${color}80`,
            }}
          />
        );
      })}

      {/* Trophy + coin */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: `translate(-50%, ${trophyBounce}px) scale(${trophyScale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: width * 0.18,
            filter: "drop-shadow(0 0 40px rgba(251, 191, 36, 0.6))",
          }}
        >
          🏆
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: "44%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: width * 0.12,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            background: "linear-gradient(135deg, #fbbf24 0%, #b26bff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          VOCÊ GANHOU!
        </div>
      </div>

      {/* Skin reveal */}
      <div
        style={{
          position: "absolute",
          top: "57%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: skinOpacity,
          transform: `scale(${skinScale})`,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: width * 0.4,
            marginBottom: 8,
          }}
        >
          {WINNER_SKIN_SRC ? (
            <Img
              src={staticFile(WINNER_SKIN_SRC)}
              style={{
                maxWidth: "70%",
                maxHeight: "100%",
                objectFit: "contain",
                filter: "drop-shadow(0 0 30px rgba(251, 191, 36, 0.5))",
              }}
            />
          ) : (
            <span style={{ fontSize: width * 0.18 }}>{WINNER_SKIN_EMOJI}</span>
          )}
        </div>
        <div
          style={{
            color: "#d1d5db",
            fontSize: width * 0.04,
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          {WINNER_SKIN_NAME}
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 12 }}>
          <Img
            src={staticFile("coin-icon.png")}
            style={{
              width: width * 0.08,
              height: width * 0.08,
              filter: "drop-shadow(0 0 20px rgba(251, 191, 36, 0.4))",
            }}
          />
          <div
            style={{
              color: "white",
              fontSize: width * 0.05,
              fontWeight: 900,
              letterSpacing: "-0.02em",
            }}
          >
            AhiruDrop
          </div>
        </div>
        <div
          style={{
            display: "inline-block",
            padding: `${width * 0.022}px ${width * 0.05}px`,
            background: "linear-gradient(135deg, #7c3aed 0%, #f59e0b 100%)",
            borderRadius: 999,
            color: "white",
            fontSize: width * 0.04,
            fontWeight: 800,
            letterSpacing: "0.1em",
            boxShadow: "0 8px 24px rgba(124, 58, 237, 0.4)",
          }}
        >
          ahirudrop.vercel.app
        </div>
      </div>
    </SceneWrapper>
  );
};
