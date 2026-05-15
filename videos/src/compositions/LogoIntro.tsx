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
import { Particles } from "../components/Particles";

export type LogoIntroProps = {
  size?: "vertical" | "square" | "horizontal";
};

const COLORS = {
  bgDark: "#07070a",
  bgPurple: "#14081f",
  primary: "#7c3aed",
  primaryBright: "#b26bff",
  accent: "#fbbf24",
  accentDark: "#f59e0b",
  white: "#fafafa",
  muted: "#a1a1aa",
};

/**
 * 5-second logo intro animation.
 *
 * Timeline (30fps):
 *   0–30   particles fade in, background settles
 *   15–60  coin springs up from bottom with rotation
 *   45–60  glow halo expands behind coin
 *   60–105 coin floats idle (sine wave)
 *   75–105 "AhiruDrop" wordmark types in
 *   90–105 tagline "RIFAS · SKINS · DIVERSÃO" fades in
 *   105–150 hold + subtle pulse, fade out at the very end
 */
export const LogoIntro: React.FC<LogoIntroProps> = ({ size = "vertical" }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  // ── Coin entrance (spring from below) ────────────────
  const coinEntry = spring({
    frame: frame - 15,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const coinY = interpolate(coinEntry, [0, 1], [400, 0]);
  const coinScale = interpolate(coinEntry, [0, 1], [0.3, 1]);
  const coinRotateEntry = interpolate(coinEntry, [0, 1], [-30, 0]);

  // ── Coin idle float (after entrance settled) ─────────
  const idleFrame = Math.max(0, frame - 60);
  const idleFloat = Math.sin((idleFrame / fps) * 1.5) * 15; // gentle 1.5 rad/sec
  const idleRotate = Math.sin((idleFrame / fps) * 1.2) * 3;

  // ── Halo glow ─────────────────────────────────────────
  const haloProgress = spring({
    frame: frame - 45,
    fps,
    config: { damping: 20, stiffness: 80 },
  });
  const haloScale = interpolate(haloProgress, [0, 1], [0.3, 1]);
  const haloOpacity = interpolate(haloProgress, [0, 1], [0, 0.7]);

  // ── Wordmark type-in ──────────────────────────────────
  const wordmark = "AhiruDrop";
  const wordmarkProgress = interpolate(frame, [75, 105], [0, wordmark.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wordmarkVisible = wordmark.slice(0, Math.floor(wordmarkProgress));
  const wordmarkOpacity = interpolate(frame, [75, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Tagline fade-in ───────────────────────────────────
  const taglineOpacity = interpolate(frame, [95, 115], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineY = interpolate(frame, [95, 115], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Final fade out ────────────────────────────────────
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ── Layout — size-aware sizing & positioning ─────────
  const isHorizontal = size === "horizontal";
  const coinSize = isHorizontal ? height * 0.45 : width * 0.45;
  const wordmarkSize = isHorizontal ? height * 0.12 : width * 0.13;
  const taglineSize = isHorizontal ? height * 0.025 : width * 0.028;
  const coinTopOffset = isHorizontal ? "38%" : "32%";
  const wordmarkTopOffset = isHorizontal ? "70%" : "60%";

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${COLORS.primary}22 0%, transparent 50%), linear-gradient(135deg, ${COLORS.bgDark} 0%, ${COLORS.bgPurple} 100%)`,
        opacity: exitOpacity,
      }}
    >
      {/* Particle field */}
      <Particles
        count={size === "horizontal" ? 40 : 30}
        width={width}
        height={height}
      />

      {/* Halo glow behind coin */}
      <div
        style={{
          position: "absolute",
          top: coinTopOffset,
          left: "50%",
          transform: `translate(-50%, -50%) scale(${haloScale})`,
          width: coinSize * 1.8,
          height: coinSize * 1.8,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.accent}66 0%, ${COLORS.primary}33 40%, transparent 70%)`,
          opacity: haloOpacity,
          filter: "blur(40px)",
        }}
      />

      {/* Coin (the real PNG asset) */}
      <div
        style={{
          position: "absolute",
          top: coinTopOffset,
          left: "50%",
          transform: `translate(-50%, calc(-50% + ${coinY + idleFloat}px)) scale(${coinScale}) rotate(${coinRotateEntry + idleRotate}deg)`,
        }}
      >
        <Img
          src={staticFile("coin-icon.png")}
          style={{
            width: coinSize,
            height: coinSize,
            filter: `drop-shadow(0 20px 40px ${COLORS.accent}40)`,
          }}
        />
      </div>

      {/* Wordmark */}
      <div
        style={{
          position: "absolute",
          top: wordmarkTopOffset,
          left: "50%",
          transform: "translate(-50%, 0)",
          opacity: wordmarkOpacity,
          fontSize: wordmarkSize,
          fontWeight: 900,
          letterSpacing: "-0.04em",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
          background: `linear-gradient(135deg, ${COLORS.primaryBright} 0%, ${COLORS.accent} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          whiteSpace: "nowrap",
        }}
      >
        {wordmarkVisible}
        {/* Blinking cursor while typing */}
        {wordmarkProgress < wordmark.length && (
          <span
            style={{
              opacity: Math.floor(frame / 8) % 2 ? 1 : 0,
              color: COLORS.accent,
              WebkitTextFillColor: COLORS.accent,
            }}
          >
            |
          </span>
        )}
      </div>

      {/* Tagline */}
      <div
        style={{
          position: "absolute",
          top: `calc(${wordmarkTopOffset} + ${wordmarkSize * 1.2}px)`,
          left: "50%",
          transform: `translate(-50%, ${taglineY}px)`,
          opacity: taglineOpacity,
          fontSize: taglineSize,
          fontWeight: 700,
          letterSpacing: "0.4em",
          color: COLORS.accent,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
          whiteSpace: "nowrap",
        }}
      >
        RIFAS · SKINS · DIVERSÃO
      </div>
    </AbsoluteFill>
  );
};
