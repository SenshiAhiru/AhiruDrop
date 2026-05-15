import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

interface TaglineProps {
  text?: string;
  /** Vertical position from the top, as % of canvas height. Default "73%". */
  topOffset?: string;
  /** Font size as % of canvas width. Default 0.028. */
  sizeRatio?: number;
  isHorizontal?: boolean;
}

/**
 * Tagline layer. Default text is "RIFAS · SKINS · DIVERSÃO" but
 * accepts any string so you can swap it per campaign.
 *
 * Animates with a 20-frame fade + 20px slide-up.
 */
export const Tagline: React.FC<TaglineProps> = ({
  text = "RIFAS · SKINS · DIVERSÃO",
  topOffset = "73%",
  sizeRatio = 0.028,
  isHorizontal = false,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [0, 20], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fontSize = (isHorizontal ? height : width) * sizeRatio;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: topOffset,
          left: "50%",
          transform: `translate(-50%, ${translateY}px)`,
          opacity,
          fontSize,
          fontWeight: 700,
          letterSpacing: "0.4em",
          color: "#fbbf24",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
