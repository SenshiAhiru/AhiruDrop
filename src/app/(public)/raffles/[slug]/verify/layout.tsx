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
      select: { title: true, skinImage: true },
    });
    if (!raffle) return { title: "Verificação Provably Fair" };
    return {
      title: `Prova de sorteio — ${raffle.title}`,
      description: `Verifique publicamente o sorteio da rifa "${raffle.title}" usando o hash do bloco Bitcoin.`,
      openGraph: {
        title: `Provably Fair: ${raffle.title}`,
        description: "Sorteio verificável publicamente com Bitcoin + HMAC-SHA256",
        images: raffle.skinImage ? [{ url: raffle.skinImage }] : undefined,
      },
    };
  } catch {
    return { title: "Verificação Provably Fair" };
  }
}

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
