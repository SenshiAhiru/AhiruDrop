import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

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
        skinImage: true,
        skinRarity: true,
        skinWear: true,
        skinWeapon: true,
        pricePerNumber: true,
        totalNumbers: true,
        status: true,
      },
    });

    if (!raffle) {
      return {
        title: "Rifa não encontrada",
        description: "A rifa que você procura não existe ou foi removida.",
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

    const description =
      raffle.shortDescription ||
      `${statusLabel} · ${raffle.totalNumbers} números · ${priceStr} AHC por cota${
        raffle.skinRarity ? ` · ${raffle.skinRarity}` : ""
      }${raffle.skinWear ? ` · ${raffle.skinWear}` : ""}. Sorteio provably fair via Bitcoin.`;

    const image = raffle.skinImage;

    return {
      title: raffle.title,
      description,
      openGraph: {
        title: `${raffle.title} — AhiruDrop`,
        description,
        images: image ? [{ url: image, width: 800, height: 600, alt: raffle.title }] : undefined,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: raffle.title,
        description,
        images: image ? [image] : undefined,
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
