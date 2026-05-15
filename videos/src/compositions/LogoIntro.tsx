import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Background } from "../components/Background";
import { Particles } from "../components/Particles";
import { CoinHalo } from "../components/CoinHalo";
import { Coin } from "../components/Coin";
import { Wordmark } from "../components/Wordmark";
import { Tagline } from "../components/Tagline";

export type LogoIntroProps = {
  size?: "vertical" | "square" | "horizontal";
  /**
   * When true, the Background layer is skipped — useful for exporting
   * the animation as PNG sequence or ProRes 4444 with alpha channel,
   * so the duck/halo/wordmark can be composited over other footage in
   * After Effects / Premiere.
   */
  transparentBackground?: boolean;
};

/**
 * 5-second logo intro animation, decomposed into independent layers.
 * Each layer lives in its own component file in `src/components/`, so
 * you can edit them separately. They show up as distinct tracks in
 * the Remotion Studio timeline thanks to <Sequence>.
 *
 * Layer order (back to front):
 *   1. Background      — frames 0–150
 *   2. Particles       — frames 0–150
 *   3. Coin Halo       — frames 45–150
 *   4. Coin            — frames 15–150
 *   5. Wordmark        — frames 75–150
 *   6. Tagline         — frames 95–150
 *
 * Each <Sequence from={X}> resets the inner component's useCurrentFrame
 * to 0 at frame X, so each layer's timing logic stays simple ("frame 0
 * = my own start").
 *
 * Final fade-out for the whole comp is handled at the outer wrapper.
 */
export const LogoIntro: React.FC<LogoIntroProps> = ({
  size = "vertical",
  transparentBackground = false,
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const isHorizontal = size === "horizontal";

  // Layout differs slightly per aspect ratio
  const coinTopOffset = isHorizontal ? "38%" : "32%";
  const wordmarkTopOffset = isHorizontal ? "70%" : "60%";
  const taglineTopOffset = isHorizontal ? "84%" : "73%";

  const coinSizeRatio = isHorizontal ? 0.45 : 0.45;
  const wordmarkSizeRatio = isHorizontal ? 0.12 : 0.13;
  const taglineSizeRatio = isHorizontal ? 0.025 : 0.028;

  // Final fade-out for the entire composition
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      {/* Layer 1 · Background — skipped when exporting with alpha */}
      {!transparentBackground && (
        <Sequence name="Background" durationInFrames={durationInFrames}>
          <Background />
        </Sequence>
      )}

      {/* Layer 2 · Particles */}
      <Sequence name="Particles" durationInFrames={durationInFrames}>
        <Particles count={size === "horizontal" ? 40 : 30} width={width} height={height} />
      </Sequence>

      {/* Layer 3 · Coin Halo (appears with coin landing) */}
      <Sequence name="Coin Halo" from={45} durationInFrames={durationInFrames - 45}>
        <CoinHalo
          topOffset={coinTopOffset}
          sizeRatio={coinSizeRatio}
          isHorizontal={isHorizontal}
        />
      </Sequence>

      {/* Layer 4 · Coin (springs up at 15) */}
      <Sequence name="Coin" from={15} durationInFrames={durationInFrames - 15}>
        <Coin
          topOffset={coinTopOffset}
          sizeRatio={coinSizeRatio}
          isHorizontal={isHorizontal}
        />
      </Sequence>

      {/* Layer 5 · Wordmark (types in at 75) */}
      <Sequence name="Wordmark" from={75} durationInFrames={durationInFrames - 75}>
        <Wordmark
          topOffset={wordmarkTopOffset}
          sizeRatio={wordmarkSizeRatio}
          isHorizontal={isHorizontal}
          typingEffect={true}
        />
      </Sequence>

      {/* Layer 6 · Tagline (fades in at 95) */}
      <Sequence name="Tagline" from={95} durationInFrames={durationInFrames - 95}>
        <Tagline
          topOffset={taglineTopOffset}
          sizeRatio={taglineSizeRatio}
          isHorizontal={isHorizontal}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
