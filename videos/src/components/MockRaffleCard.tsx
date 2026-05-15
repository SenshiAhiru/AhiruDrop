interface MockRaffleCardProps {
  weapon: string;
  skin: string;
  emoji: string;
  rarity: string;
  rarityColor: string;
  price: string;
  width?: number;
}

/**
 * Faux raffle card used in the showcase video. Mirrors the visual
 * language of the real card component on the site but rendered
 * as standalone JSX so we can animate it directly.
 */
export const MockRaffleCard: React.FC<MockRaffleCardProps> = ({
  weapon,
  skin,
  emoji,
  rarity,
  rarityColor,
  price,
  width = 280,
}) => {
  return (
    <div
      style={{
        width,
        background: "#18181b",
        border: "2px solid #27272a",
        borderRadius: 20,
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        boxShadow: `0 20px 40px -16px ${rarityColor}50`,
      }}
    >
      {/* Skin "image" */}
      <div
        style={{
          height: width * 0.7,
          background: `radial-gradient(circle at center, ${rarityColor}33 0%, transparent 65%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: width * 0.4,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: `1px solid ${rarityColor}30`,
            borderRadius: "20px 20px 0 0",
          }}
        />
        {emoji}
      </div>

      {/* Body */}
      <div style={{ padding: width * 0.07 }}>
        <div
          style={{
            color: "#a1a1aa",
            fontSize: width * 0.045,
            letterSpacing: "0.15em",
            fontWeight: 700,
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          {weapon}
        </div>
        <div
          style={{
            color: "white",
            fontSize: width * 0.075,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: 10,
          }}
        >
          {skin}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: width * 0.045,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 6,
              background: `${rarityColor}22`,
              color: rarityColor,
              border: `1px solid ${rarityColor}40`,
            }}
          >
            {rarity}
          </span>
          <span
            style={{
              color: "#fbbf24",
              fontWeight: 900,
              fontSize: width * 0.07,
              fontFamily: "'SF Mono', Menlo, monospace",
            }}
          >
            {price}
          </span>
        </div>
      </div>
    </div>
  );
};
