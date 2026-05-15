import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

interface CoinHaloProps {
  topOffset?: string;
  sizeRatio?: number;
  isHorizontal?: boolean;
}

/**
 * Halo glow layer behind the coin. Expands with spring physics,
 * then breathes subtly (scale pulse) while visible.
 *
 * Wrap in <Sequence from={45}> so it kicks in after the coin starts
 * dropping in, behind it.
 */
export const CoinHalo: React.FC<CoinHaloProps> = ({
  topOffset = "32%",
  sizeRatio = 0.45,
  isHorizontal = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80 },
  });
  const scale = interpolate(progress, [0, 1], [0.3, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 0.7]);

  // Gentle breathing scale after fully expanded
  const breathe = 1 + Math.sin((frame / fps) * 1.2) * 0.04;

  const coinSize = (isHorizontal ? height : width) * sizeRatio;
  const haloSize = coinSize * 1.8;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: topOffset,
          left: "50%",
          transform: `translate(-50%, -50%) scale(${scale * breathe})`,
          width: haloSize,
          height: haloSize,
          borderRadius: "50%",
          background: "radial-gradient(circle, #fbbf2466 0%, #7c3aed33 40%, transparent 70%)",
          opacity,
          filter: "blur(40px)",
        }}
      />
    </AbsoluteFill>
  );
};
