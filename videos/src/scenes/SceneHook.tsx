import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { SceneWrapper } from "../components/SceneWrapper";
import { Particles } from "../components/Particles";

const DURATION = 90; // 3s @ 30fps
export const sceneHookDuration = DURATION;

export type SceneHookProps = { transparentBackground?: boolean };

/**
 * Cena 1 · HOOK (0:00–0:03)
 *
 * Abre o vídeo com a marca + tagline impactante.
 *
 * - Moeda entra de baixo com spring
 * - "AhiruDrop" wordmark fade in
 * - "SUA SORTE PODE SER ÉPICA" headline grande
 * - Particles ao fundo
 */
export const SceneHook: React.FC<SceneHookProps> = ({ transparentBackground = false }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Coin spring entry
  const coinSpring = spring({ frame, fps, config: { damping: 14, stiffness: 110 } });
  const coinY = interpolate(coinSpring, [0, 1], [200, 0]);
  const coinScale = interpolate(coinSpring, [0, 1], [0.4, 1]);

  // Wordmark fade
  const wordmarkOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wordmarkY = interpolate(frame, [20, 40], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Headline split — appears word by word
  const words = ["SUA", "SORTE", "PODE SER", "ÉPICA"];
  const headlineProgress = (i: number) =>
    interpolate(frame, [40 + i * 6, 55 + i * 6], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <SceneWrapper durationInFrames={DURATION}>
      {!transparentBackground && (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, #14081f 0%, #07070a 100%)",
          }}
        />
      )}
      {!transparentBackground && <Particles count={25} width={width} height={height} />}

      {/* Coin */}
      <div
        style={{
          position: "absolute",
          top: "22%",
          left: "50%",
          transform: `translate(-50%, calc(-50% + ${coinY}px)) scale(${coinScale})`,
        }}
      >
        <Img
          src={staticFile("coin-icon.png")}
          style={{
            width: width * 0.32,
            height: width * 0.32,
            filter: "drop-shadow(0 16px 40px #fbbf2455)",
          }}
        />
      </div>

      {/* Wordmark below coin */}
      <div
        style={{
          position: "absolute",
          top: "44%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: wordmarkOpacity,
          transform: `translateY(${wordmarkY}px)`,
          fontSize: width * 0.08,
          fontWeight: 900,
          letterSpacing: "0.01em",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
          background: "linear-gradient(135deg, #b26bff 0%, #fbbf24 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        AhiruDrop
      </div>

      {/* Big headline */}
      <div
        style={{
          position: "absolute",
          bottom: "18%",
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: width * 0.11,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: "white",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        }}
      >
        {words.map((w, i) => {
          const p = headlineProgress(i);
          return (
            <span
              key={i}
              style={{
                display: "block",
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)`,
                color: w === "ÉPICA" ? "#fbbf24" : "white",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </SceneWrapper>
  );
};
