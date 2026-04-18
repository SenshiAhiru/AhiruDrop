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

    // Rich title: "AK-47 | Redline (Field-Tested) — Rifa por R$ 5,00"
    const title =
      raffle.skinWeapon && raffle.skinName
        ? `${raffle.skinWeapon} | ${raffle.skinName}${
            raffle.skinWear ? ` (${raffle.skinWear})` : ""
          } — Rifa por R$ ${priceStr}`
        : `${raffle.title} — Rifa CS2`;

    const description =
      raffle.shortDescription ||
      (raffle.description && raffle.description.slice(0, 155)) ||
      `${statusLabel} · ${raffle.totalNumbers} números · R$ ${priceStr} por cota${
        raffle.skinRarity ? ` · ${raffle.skinRarity}` : ""
      }${raffle.skinWear ? ` · ${raffle.skinWear}` : ""}. Sorteio provably fair via Bitcoin.`;

    const image = raffle.skinImage || raffle.featuredImage || "/og-image.png";
    const url = `${SITE_URL}/raffles/${slug}`;

    // Only index rifas em estados públicos. Draft/Paused/Cancelled = noindex.
    const indexable =
      raffle.status === "ACTIVE" ||
      raffle.status === "CLOSED" ||
      raffle.status === "DRAWN";

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
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: raffle.skinName ?? raffle.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
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
