import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { SceneWrapper } from "../components/SceneWrapper";
import { MockRaffleCard } from "../components/MockRaffleCard";

const DURATION = 90; // 3s
export const sceneBrowseDuration = DURATION;

const CARDS = [
  {
    weapon: "AK-47",
    skin: "Wild Lotus",
    emoji: "🔫",
    rarity: "Covert",
    rarityColor: "#eb4b4b",
    price: "1.250",
  },
  {
    weapon: "AWP",
    skin: "Dragon Lore",
    emoji: "🎯",
    rarity: "Classified",
    rarityColor: "#d32ce6",
    price: "2.350",
  },
  {
    weapon: "Karambit",
    skin: "Doppler",
    emoji: "🗡️",
    rarity: "Restricted",
    rarityColor: "#8847ff",
    price: "3.750",
  },
];

/**
 * Cena 2 · BROWSE (0:03–0:06)
 *
 * 3 cards de rifa entram em cascata pela direita.
 * Header "ESCOLHA SUA RIFA" desliza de cima.
 */
export const SceneBrowse: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // Header
  const headerOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headerY = interpolate(frame, [0, 15], [-30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Card stagger
  const cardStagger = (i: number) => {
    const start = 10 + i * 10;
    const s = spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 100 } });
    return {
      opacity: s,
      translateX: interpolate(s, [0, 1], [200, 0]),
      scale: interpolate(s, [0, 1], [0.85, 1]),
    };
  };

  return (
    <SceneWrapper durationInFrames={DURATION}>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, #07070a 0%, #14081f 100%)",
        }}
      />

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
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
          ESCOLHA SUA RIFA
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
          Skins reais de <span style={{ color: "#fbbf24" }}>CS2</span>
        </div>
      </div>

      {/* Cards stacked vertically */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {CARDS.map((card, i) => {
          const anim = cardStagger(i);
          return (
            <div
              key={i}
              style={{
                opacity: anim.opacity,
                transform: `translateX(${anim.translateX}px) scale(${anim.scale})`,
              }}
            >
              <MockRaffleCard {...card} width={width * 0.7} />
            </div>
          );
        })}
      </div>
    </SceneWrapper>
  );
};
