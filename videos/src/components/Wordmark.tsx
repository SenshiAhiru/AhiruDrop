import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

interface WordmarkProps {
  /** Vertical position from the top, as % of canvas height. Default "60%". */
  topOffset?: string;
  /** Font size as % of canvas width. Default 0.13. */
  sizeRatio?: number;
  isHorizontal?: boolean;
  /**
   * If true, letters appear one by one (typing effect). If false, the
   * whole wordmark fades in together.
   */
  typingEffect?: boolean;
}

/**
 * "AhiruDrop" wordmark with gradient fill (purple → gold).
 *
 * Two modes:
 *   typingEffect=true  → letters appear one by one with blinking cursor
 *   typingEffect=false → full word fades + slides up
 *
 * Letter-spacing is `0.01em` (slightly loose) so individual letters
 * read clearly even at smaller render sizes.
 */
export const Wordmark: React.FC<WordmarkProps> = ({
  topOffset = "60%",
  sizeRatio = 0.13,
  isHorizontal = false,
  typingEffect = true,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const text = "AhiruDrop";
  const fontSize = (isHorizontal ? height : width) * sizeRatio;

  // Mode A: typing effect (default)
  const typingProgress = interpolate(frame, [0, 30], [0, text.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const visibleText = typingEffect ? text.slice(0, Math.floor(typingProgress)) : text;
  const showCursor = typingEffect && typingProgress < text.length;

  // Mode B: fade + slide (when typingEffect=false)
  const fadeOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeY = interpolate(frame, [0, 15], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = typingEffect
    ? interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : fadeOpacity;
  const translateY = typingEffect ? 0 : fadeY;

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
          fontWeight: 900,
          letterSpacing: "0.01em",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
          background: "linear-gradient(135deg, #b26bff 0%, #fbbf24 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          whiteSpace: "nowrap",
        }}
      >
        {visibleText}
        {showCursor && (
          <span
            style={{
              opacity: Math.floor(frame / 8) % 2 ? 1 : 0,
              color: "#fbbf24",
              WebkitTextFillColor: "#fbbf24",
            }}
          >
            |
          </span>
        )}
      </div>
    </AbsoluteFill>
  );
};
