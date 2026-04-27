import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

/**
 * Dynamic Open Graph image per raffle (1200×630).
 *
 * Renders a branded card via Satori (next/og) so links shared on
 * WhatsApp/Discord/Twitter show a polished preview instead of the raw
 * skin PNG (which can look weird on light/dark backgrounds depending
 * on the platform).
 *
 * Cached automatically per slug. Regenerated on deploy or when the
 * underlying raffle row changes (since we read it via Prisma).
 */

export const alt = "AhiruDrop — Rifa de Skin CS2";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  let raffle: {
    title: string;
    skinImage: string | null;
    skinName: string | null;
    skinWeapon: string | null;
    skinRarity: string | null;
    skinRarityColor: string | null;
    skinWear: string | null;
    skinStatTrak: boolean;
    pricePerNumber: { toString(): string };
    totalNumbers: number;
    status: string;
  } | null = null;

  try {
    raffle = await prisma.raffle.findUnique({
      where: { slug: params.slug },
      select: {
        title: true,
        skinImage: true,
        skinName: true,
        skinWeapon: true,
        skinRarity: true,
        skinRarityColor: true,
        skinWear: true,
        skinStatTrak: true,
        pricePerNumber: true,
        totalNumbers: true,
        status: true,
      },
    });
  } catch {
    // Fall through to fallback below
  }

  // Fallback card — used if raffle not found or DB error
  if (!raffle) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0b0b0f 0%, #1a0b2e 100%)",
            color: "white",
            fontSize: 64,
            fontWeight: 800,
          }}
        >
          AhiruDrop
        </div>
      ),
      size
    );
  }

  const rarityColor = raffle.skinRarityColor || "#a78bfa";
  const priceStr = Number(raffle.pricePerNumber).toFixed(2);
  const weapon = raffle.skinWeapon ?? "";
  const skinName = raffle.skinName ?? raffle.title;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `radial-gradient(circle at 30% 40%, ${rarityColor}25 0%, transparent 55%), linear-gradient(135deg, #07070a 0%, #14081f 100%)`,
          color: "white",
          fontFamily: "system-ui, sans-serif",
          padding: 56,
          position: "relative",
        }}
      >
        {/* Top bar — brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: -0.5,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #7c3aed, #fbbf24)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              🦆
            </div>
            <span>AhiruDrop</span>
          </div>

          {/* Provably Fair badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              borderRadius: 999,
              padding: "10px 18px",
              fontSize: 18,
              fontWeight: 600,
              color: "#34d399",
            }}
          >
            ✓ Provably Fair · Bitcoin
          </div>
        </div>

        {/* Body — skin + info */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            gap: 40,
            marginTop: 30,
          }}
        >
          {/* Left: skin image */}
          <div
            style={{
              width: 480,
              height: 380,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 24,
              background: `radial-gradient(circle at center, ${rarityColor}30 0%, transparent 65%)`,
              border: `2px solid ${rarityColor}40`,
              flexShrink: 0,
            }}
          >
            {raffle.skinImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={raffle.skinImage}
                alt={skinName}
                width={420}
                height={320}
                style={{
                  objectFit: "contain",
                  filter: `drop-shadow(0 0 40px ${rarityColor}80)`,
                }}
              />
            ) : (
              <div style={{ fontSize: 120, display: "flex" }}>🎁</div>
            )}
          </div>

          {/* Right: info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: 18,
            }}
          >
            {weapon && (
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#a1a1aa",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                {weapon}
              </div>
            )}

            <div
              style={{
                fontSize: 56,
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: -1.5,
                display: "flex",
              }}
            >
              {skinName}
            </div>

            {/* Tag row */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {raffle.skinRarity && (
                <div
                  style={{
                    background: `${rarityColor}20`,
                    border: `1px solid ${rarityColor}60`,
                    color: rarityColor,
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {raffle.skinRarity}
                </div>
              )}
              {raffle.skinWear && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  {raffle.skinWear}
                </div>
              )}
              {raffle.skinStatTrak && (
                <div
                  style={{
                    background: "rgba(249, 115, 22, 0.15)",
                    border: "1px solid rgba(249, 115, 22, 0.5)",
                    color: "#fb923c",
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  StatTrak™
                </div>
              )}
            </div>

            {/* Price card */}
            <div
              style={{
                marginTop: 8,
                background: "rgba(251, 191, 36, 0.10)",
                border: "1px solid rgba(251, 191, 36, 0.35)",
                borderRadius: 16,
                padding: 22,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  color: "#a1a1aa",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  fontWeight: 600,
                }}
              >
                Por número
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 56,
                    fontWeight: 900,
                    color: "#fbbf24",
                    lineHeight: 1,
                  }}
                >
                  {priceStr}
                </span>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#fbbf24",
                  }}
                >
                  AHC
                </span>
                <span
                  style={{
                    fontSize: 18,
                    color: "#71717a",
                    marginLeft: 12,
                  }}
                >
                  · {raffle.totalNumbers} números
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom hint */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            color: "#71717a",
            fontSize: 18,
            fontWeight: 500,
          }}
        >
          ahirudrop.vercel.app
        </div>
      </div>
    ),
    size
  );
}
