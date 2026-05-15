import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

interface CoinProps {
  /** Vertical position from the top, as % of canvas height. Default "32%". */
  topOffset?: string;
  /** Coin size as % of canvas width. Default 0.45 (45%). */
  sizeRatio?: number;
  /** When using horizontal canvas, size is computed from height instead of width. */
  isHorizontal?: boolean;
}

/**
 * Coin layer — handles the entrance spring + the idle float.
 *
 * The component assumes it's wrapped in a <Sequence from={X}> in the parent,
 * so useCurrentFrame() here returns frames *relative to* the sequence start
 * (frame 0 = when this coin first appears).
 *
 * Entrance timeline (relative to sequence start):
 *   0–45  spring up from 400px below, scale 0.3 → 1, rotate -30° → 0°
 *   45+   idle float (sine wave on Y, gentle sway in rotation)
 */
export const Coin: React.FC<CoinProps> = ({
  topOffset = "32%",
  sizeRatio = 0.45,
  isHorizontal = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ── Entrance spring ─────────────────────────────────────────────
  const entry = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const entryY = interpolate(entry, [0, 1], [400, 0]);
  const entryScale = interpolate(entry, [0, 1], [0.3, 1]);
  const entryRotate = interpolate(entry, [0, 1], [-30, 0]);

  // ── Idle float (starts settling around frame 45) ────────────────
  const idleFrame = Math.max(0, frame - 45);
  const idleFloat = Math.sin((idleFrame / fps) * 1.5) * 15;
  const idleRotate = Math.sin((idleFrame / fps) * 1.2) * 3;

  const coinSize = (isHorizontal ? height : width) * sizeRatio;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: topOffset,
          left: "50%",
          transform: `
            translate(-50%, calc(-50% + ${entryY + idleFloat}px))
            scale(${entryScale})
            rotate(${entryRotate + idleRotate}deg)
          `,
        }}
      >
        <Img
          src={staticFile("coin-icon.png")}
          style={{
            width: coinSize,
            height: coinSize,
            filter: "drop-shadow(0 20px 40px #fbbf2440)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
