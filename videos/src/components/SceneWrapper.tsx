import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

interface SceneWrapperProps {
  children: React.ReactNode;
  /** Duration of fade-in at the start of the scene (in frames). Default 12. */
  fadeIn?: number;
  /** Duration of fade-out at the end (in frames). Default 12. */
  fadeOut?: number;
  /** Total duration of the scene in frames — required for fade-out math. */
  durationInFrames: number;
}

/**
 * Wraps a scene with consistent fade-in / fade-out. Each scene's
 * internal animation logic stays untouched; this only fades the
 * whole layer at the boundaries so they crossfade cleanly when
 * chained in <SiteShowcase>.
 */
export const SceneWrapper: React.FC<SceneWrapperProps> = ({
  children,
  fadeIn = 12,
  fadeOut = 12,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  const opacityIn = interpolate(frame, [0, fadeIn], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacityOut = interpolate(
    frame,
    [durationInFrames - fadeOut, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity = Math.min(opacityIn, opacityOut);

  return (
    <AbsoluteFill style={{ opacity }}>
      {children}
    </AbsoluteFill>
  );
};
