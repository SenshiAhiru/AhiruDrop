import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  random,
} from "remotion";
import { SceneWrapper } from "../components/SceneWrapper";

const DURATION = 90; // 3s
export const sceneDrawDuration = DURATION;

export type SceneDrawProps = { transparentBackground?: boolean };

const HASH = "00000000000000000003d4f8a2c1e7b9f6a8d2c5e1f4b7a9c3d6e8f1a4b7c2d5";

/**
 * Cena 4 · DRAW (0:09–0:12)
 *
 * Provably Fair em destaque: hash do bloco BTC se forma,
 * "PROVABLY FAIR · 100% VERIFICÁVEL" aparece, número
 * vencedor é revelado.
 */
export const SceneDraw: React.FC<SceneDrawProps> = ({ transparentBackground = false }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // Hash characters reveal one by one
  const hashChars = Math.floor(
    interpolate(frame, [10, 45], [0, HASH.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Header
  const headerOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Badge "Provably Fair" spring in
  const badgeSpring = spring({
    frame: frame - 30,
    fps,
    config: { damping: 14 },
  });

  // Winning number reveals
  const winningNumberSpring = spring({
    frame: frame - 55,
    fps,
    config: { damping: 12, stiffness: 110 },
  });
  const winningScale = interpolate(winningNumberSpring, [0, 1], [0.3, 1]);
  const winningOpacity = winningNumberSpring;

  // Simulated number rolling before settling on 42
  let displayNumber: number | string = "??";
  if (frame >= 55 && frame < 75) {
    // Roll random digits during reveal
    displayNumber = Math.floor(random(`roll-${Math.floor(frame / 2)}`) * 50);
  } else if (frame >= 75) {
    displayNumber = 42;
  }

  return (
    <SceneWrapper durationInFrames={DURATION}>
      {!transparentBackground && (
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, #0a0d10 0%, #0d2a14 100%)",
          }}
        />
      )}

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: headerOpacity,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            color: "#34d399",
            fontSize: width * 0.035,
            letterSpacing: "0.4em",
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          PROVABLY FAIR
        </div>
        <div
          style={{
            color: "white",
            fontSize: width * 0.065,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
        >
          Sorteio via <span style={{ color: "#34d399" }}>Bitcoin</span>
        </div>
      </div>

      {/* Hash visualization */}
      <div
        style={{
          position: "absolute",
          top: "32%",
          left: "8%",
          right: "8%",
          padding: width * 0.04,
          background: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          borderRadius: 16,
        }}
      >
        <div
          style={{
            color: "#34d399",
            fontSize: width * 0.025,
            letterSpacing: "0.3em",
            fontWeight: 700,
            marginBottom: 12,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
          }}
        >
          ⛓️ BLOCK HASH
        </div>
        <div
          style={{
            color: "#d1fae5",
            fontFamily: "'SF Mono', Menlo, monospace",
            fontSize: width * 0.028,
            wordBreak: "break-all",
            lineHeight: 1.4,
            letterSpacing: "0.05em",
          }}
        >
          {HASH.slice(0, hashChars)}
          {hashChars < HASH.length && (
            <span
              style={{
                color: "#fbbf24",
                opacity: Math.floor(frame / 4) % 2,
              }}
            >
              ▌
            </span>
          )}
        </div>
      </div>

      {/* Provably Fair badge */}
      <div
        style={{
          position: "absolute",
          top: "62%",
          left: "50%",
          transform: `translateX(-50%) scale(${badgeSpring})`,
          opacity: badgeSpring,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: `${width * 0.025}px ${width * 0.06}px`,
          background: "rgba(16, 185, 129, 0.15)",
          border: "2px solid #10b981",
          borderRadius: 999,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        }}
      >
        <span style={{ fontSize: width * 0.04 }}>✅</span>
        <span
          style={{
            color: "#34d399",
            fontWeight: 800,
            fontSize: width * 0.035,
            letterSpacing: "0.15em",
          }}
        >
          100% VERIFICÁVEL
        </span>
      </div>

      {/* Winning number reveal */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: winningOpacity,
          transform: `scale(${winningScale})`,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            color: "#fbbf24",
            fontSize: width * 0.025,
            letterSpacing: "0.3em",
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          NÚMERO SORTEADO
        </div>
        <div
          style={{
            color: "#fbbf24",
            fontSize: width * 0.18,
            fontWeight: 900,
            lineHeight: 1,
            fontFamily: "'SF Mono', Menlo, monospace",
            textShadow: "0 0 40px rgba(251, 191, 36, 0.5)",
          }}
        >
          #{displayNumber}
        </div>
      </div>
    </SceneWrapper>
  );
};
