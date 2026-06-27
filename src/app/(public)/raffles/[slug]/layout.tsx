import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getServerT } from "@/i18n/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ahirudrop.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { t, locale } = await getServerT();

  try {
    const raffle = await prisma.raffle.findUnique({
      where: { slug },
      select: {
        title: true,
        titleEn: true,
        description: true,
        descriptionEn: true,
        shortDescription: true,
        shortDescriptionEn: true,
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
        title: t("meta.raffle.notFoundTitle"),
        description: t("meta.raffle.notFoundDesc"),
        robots: { index: false, follow: false },
      };
    }

    const isEn = locale === "en";
    const localizedTitle = (isEn && raffle.titleEn) || raffle.title;
    const priceStr = Number(raffle.pricePerNumber).toFixed(2);
    const statusLabel =
      raffle.status === "ACTIVE"
        ? t("meta.raffle.statusAvailable")
        : raffle.status === "CLOSED"
        ? t("meta.raffle.statusWaiting")
        : raffle.status === "DRAWN"
        ? t("meta.raffle.statusDrawn")
        : raffle.status;

    // Build skin name without duplicating the weapon. Some entries store
    // skinName already prefixed (e.g. weapon="M4A4", skinName="M4A4 | Desolate
    // Space") which would otherwise render as "M4A4 | M4A4 | Desolate Space".
    let skinTitle = raffle.skinName?.trim() || localizedTitle;
    if (
      raffle.skinWeapon &&
      raffle.skinName &&
      !raffle.skinName.toLowerCase().startsWith(raffle.skinWeapon.toLowerCase())
    ) {
      skinTitle = `${raffle.skinWeapon} | ${raffle.skinName}`;
    }
    const titleHead = raffle.skinName
      ? `${skinTitle}${raffle.skinWear ? ` (${raffle.skinWear})` : ""}`
      : localizedTitle;

    // Price tag uses AHC (the platform's internal currency). Showing "R$"
    // here was misleading — pricePerNumber is denominated in AHC, not reais.
    const title = `${titleHead} — ${t("meta.raffle.titleSuffix", { price: priceStr })}`;

    const localizedShort = (isEn && raffle.shortDescriptionEn) || raffle.shortDescription;
    const localizedDesc = (isEn && raffle.descriptionEn) || raffle.description;
    const description =
      localizedShort ||
      (localizedDesc && localizedDesc.slice(0, 155)) ||
      `${statusLabel} · ${t("meta.raffle.descNumbers", { total: raffle.totalNumbers })} · ${t("meta.raffle.descPerTicket", { price: priceStr })}${
        raffle.skinRarity ? ` · ${raffle.skinRarity}` : ""
      }${raffle.skinWear ? ` · ${raffle.skinWear}` : ""}. ${t("meta.raffle.descProvablyFair")}`;

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
        locale: isEn ? "en_US" : "pt_BR",
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
      title: t("meta.raffle.fallbackTitle"),
      description: t("meta.raffle.fallbackDesc"),
    };
  }
}

export default function RaffleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
