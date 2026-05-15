import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Img,
  staticFile,
} from "remotion";
import { SceneWrapper } from "../components/SceneWrapper";

const DURATION = 90; // 3s
export const sceneBuyDuration = DURATION;

const TOTAL_NUMBERS = 50; // 5 cols × 10 rows
const COLS = 5;
const SELECTED = [7, 18, 23, 31, 42]; // numbers that "light up"

/**
 * Cena 3 · BUY (0:06–0:09)
 *
 * Grid de números aparece, alguns acendem em roxo, saldo
 * AHC desce. Mostra a mecânica de compra direta.
 */
export const SceneBuy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // Header
  const headerOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Grid fade in
  const gridOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Selected numbers light up over time (one every 6 frames starting at frame 30)
  const selectedActive = (num: number) => {
    const idx = SELECTED.indexOf(num);
    if (idx === -1) return false;
    return frame >= 30 + idx * 6;
  };

  // AHC counter: 1500 → 1250 across 30 frames starting at frame 50
  const ahc = Math.round(
    interpolate(frame, [50, 80], [1500, 1250], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const cellSize = width * 0.13;
  const gap = width * 0.018;

  return (
    <SceneWrapper durationInFrames={DURATION}>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, #14081f 0%, #07070a 100%)",
        }}
      />

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
            color: "#fbbf24",
            fontSize: width * 0.035,
            letterSpacing: "0.4em",
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          COMPRE SEUS NÚMEROS
        </div>
        <div
          style={{
            color: "white",
            fontSize: width * 0.07,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
        >
          Saldo debita <span style={{ color: "#a78bfa" }}>na hora</span>
        </div>
      </div>

      {/* Number grid */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, ${cellSize}px)`,
          gap,
          opacity: gridOpacity,
          padding: width * 0.04,
          background: "#18181b",
          border: "1px solid #27272a",
          borderRadius: 24,
        }}
      >
        {Array.from({ length: TOTAL_NUMBERS }).map((_, i) => {
          const isSelected = selectedActive(i);
          return (
            <div
              key={i}
              style={{
                width: cellSize,
                height: cellSize,
                borderRadius: 12,
                background: isSelected ? "rgba(124, 58, 237, 0.25)" : "rgba(63, 63, 70, 0.5)",
                border: isSelected ? "1.5px solid #a78bfa" : "1px solid transparent",
                color: isSelected ? "#c4b5fd" : "#a1a1aa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: width * 0.04,
                fontWeight: 700,
                fontFamily: "'SF Mono', Menlo, monospace",
                transform: isSelected ? "scale(1.05)" : "scale(1)",
                transition: "all 0.2s",
                boxShadow: isSelected ? "0 0 20px rgba(167, 139, 250, 0.3)" : "none",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
          );
        })}
      </div>

      {/* AHC balance counter */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: width * 0.03,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        }}
      >
        <Img
          src={staticFile("coin-icon.png")}
          style={{
            width: width * 0.1,
            height: width * 0.1,
            filter: "drop-shadow(0 0 20px rgba(251, 191, 36, 0.4))",
          }}
        />
        <div>
          <div
            style={{
              color: "#71717a",
              fontSize: width * 0.025,
              letterSpacing: "0.2em",
              fontWeight: 700,
              marginBottom: 2,
            }}
          >
            SEU SALDO
          </div>
          <div
            style={{
              color: "#fbbf24",
              fontSize: width * 0.09,
              fontWeight: 900,
              fontFamily: "'SF Mono', Menlo, monospace",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {ahc.toLocaleString("pt-BR")}
            <span style={{ fontSize: width * 0.04, color: "#d97706", marginLeft: 8 }}>
              AHC
            </span>
          </div>
        </div>
      </div>
    </SceneWrapper>
  );
};
