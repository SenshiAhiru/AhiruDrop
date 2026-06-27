import type { Metadata } from "next";
import { getServerT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();
  return {
    title: t("meta.raffles.title"),
    description: t("meta.raffles.description"),
    openGraph: {
      title: t("meta.raffles.ogTitle"),
      description: t("meta.raffles.ogDescription"),
    },
  };
}

export default function RafflesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
