import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getServerT } from "@/i18n/server";

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
      select: { title: true, titleEn: true, skinImage: true },
    });
    if (!raffle) return { title: t("meta.verify.defaultTitle") };
    const title = (locale === "en" && raffle.titleEn) || raffle.title;
    return {
      title: t("meta.verify.title", { title }),
      description: t("meta.verify.description", { title }),
      openGraph: {
        title: t("meta.verify.ogTitle", { title }),
        description: t("meta.verify.ogDescription"),
        images: raffle.skinImage ? [{ url: raffle.skinImage }] : undefined,
      },
    };
  } catch {
    return { title: t("meta.verify.defaultTitle") };
  }
}

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
