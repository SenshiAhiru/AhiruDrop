import type { Metadata } from "next";
import { getServerT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();
  return {
    title: t("meta.winners.title"),
    description: t("meta.winners.description"),
    openGraph: {
      title: t("meta.winners.ogTitle"),
      description: t("meta.winners.ogDescription"),
    },
  };
}

export default function WinnersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
