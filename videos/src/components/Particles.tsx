import { useCurrentFrame, useVideoConfig, random } from "remotion";

interface ParticlesProps {
  count: number;
  width: number;
  height: number;
}

const COLORS = ["#a78bfa", "#b26bff", "#fbbf24", "#fde68a", "#7c3aed"];

/**
 * Deterministic particle field. Uses Remotion's random() with stable seeds
 * so the same frame always produces the same particle positions — required
 * for video rendering (Math.random() would change every render call).
 */
export const Particles: React.FC<ParticlesProps> = ({ count, width, height }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const particles = Array.from({ length: count }).map((_, i) => {
    // Stable per-particle randoms — same seed = same value across frames
    const startX = random(`x-${i}`) * width;
    const startY = random(`y-${i}`) * height;
    const speedX = (random(`sx-${i}`) - 0.5) * 0.3;
    const speedY = (random(`sy-${i}`) - 0.5) * 0.3 - 0.1;
    const size = random(`s-${i}`) * 4 + 1;
    const color = COLORS[Math.floor(random(`c-${i}`) * COLORS.length)];
    const baseOpacity = random(`o-${i}`) * 0.4 + 0.2;

    // Twinkle effect — opacity oscillates with each particle's own phase
    const twinklePhase = random(`tp-${i}`) * Math.PI * 2;
    const twinkleFreq = 1 + random(`tf-${i}`);
    const twinkle = (Math.sin((frame / fps) * twinkleFreq + twinklePhase) + 1) / 2;
    const opacity = baseOpacity * (0.5 + 0.5 * twinkle);

    // Wrap positions around the screen edges
    const x = (startX + speedX * frame * fps) % width;
    const y = (startY + speedY * frame * fps) % height;
    const wrappedX = x < 0 ? x + width : x;
    const wrappedY = y < 0 ? y + height : y;

    // Fade-in for the first second
    const fadeIn = Math.min(frame / 30, 1);

    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: wrappedX,
          top: wrappedY,
          width: size,
          height: size,
          borderRadius: "50%",
          background: color,
          opacity: opacity * fadeIn,
          boxShadow: `0 0 ${size * 2}px ${color}`,
        }}
      />
    );
  });

  return <>{particles}</>;
};
