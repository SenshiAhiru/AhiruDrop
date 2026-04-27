import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ahirudrop.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const raffle = await prisma.raffle.findUnique({
      where: { slug },
      select: {
        title: true,
        description: true,
        shortDescription: true,
        skinName: true,
        skinImage: true,
        skinRarity: true,
        skinWear: true,
        skinWeapon: true,
        skinMarketPrice: true,
        pricePerNumber: true,
        totalNumbers: true,
        status: true,
        featuredImage: true,
      },
    });

    if (!raffle) {
      return {
        title: "Rifa não encontrada",
        description: "A rifa que você procura não existe ou foi removida.",
        robots: { index: false, follow: false },
      };
    }

    const priceStr = Number(raffle.pricePerNumber).toFixed(2);
    const statusLabel =
      raffle.status === "ACTIVE"
        ? "Disponível"
        : raffle.status === "CLOSED"
        ? "Aguardando sorteio"
        : raffle.status === "DRAWN"
        ? "Sorteada"
        : raffle.status;

    // Build skin name without duplicating the weapon. Some entries store
    // skinName already prefixed (e.g. weapon="M4A4", skinName="M4A4 | Desolate
    // Space") which would otherwise render as "M4A4 | M4A4 | Desolate Space".
    let skinTitle = raffle.skinName?.trim() || raffle.title;
    if (
      raffle.skinWeapon &&
      raffle.skinName &&
      !raffle.skinName.toLowerCase().startsWith(raffle.skinWeapon.toLowerCase())
    ) {
      skinTitle = `${raffle.skinWeapon} | ${raffle.skinName}`;
    }
    const titleHead = raffle.skinName
      ? `${skinTitle}${raffle.skinWear ? ` (${raffle.skinWear})` : ""}`
      : raffle.title;

    // Price tag uses AHC (the platform's internal currency). Showing "R$"
    // here was misleading — pricePerNumber is denominated in AHC, not reais.
    const title = `${titleHead} — Rifa por ${priceStr} AHC`;

    const description =
      raffle.shortDescription ||
      (raffle.description && raffle.description.slice(0, 155)) ||
      `${statusLabel} · ${raffle.totalNumbers} números · ${priceStr} AHC por cota${
        raffle.skinRarity ? ` · ${raffle.skinRarity}` : ""
      }${raffle.skinWear ? ` · ${raffle.skinWear}` : ""}. Sorteio provably fair via Bitcoin.`;

    const url = `${SITE_URL}/raffles/${slug}`;

    // Only index rifas em estados públicos. Draft/Paused/Cancelled = noindex.
    const indexable =
      raffle.status === "ACTIVE" ||
      raffle.status === "CLOSED" ||
      raffle.status === "DRAWN";

    // NOTE: og:image is provided by `opengraph-image.tsx` in this same
    // route segment — Next.js auto-injects the right meta tags. Don't
    // duplicate `images` here or you get conflicting og:image tags.
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "website",
        locale: "pt_BR",
        url,
        siteName: "AhiruDrop",
        title,
        description,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
      robots: indexable
        ? {
            index: true,
            follow: true,
            googleBot: {
              index: true,
              follow: true,
              "max-image-preview": "large",
            },
          }
        : { index: false, follow: false },
      other: {
        "product:price:amount": priceStr,
        "product:price:currency": "BRL",
        ...(raffle.skinRarity && { "product:rarity": raffle.skinRarity }),
        ...(raffle.skinMarketPrice && {
          "product:retail_price:amount": Number(raffle.skinMarketPrice).toFixed(2),
        }),
      },
    };
  } catch {
    return {
      title: "Rifa",
      description: "Participe de rifas de skins CS2 no AhiruDrop",
    };
  }
}

export default function RaffleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
