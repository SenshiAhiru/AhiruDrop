import type { Metadata } from "next";
import { getServerT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();
  return {
    title: t("meta.about.title"),
    description: t("meta.about.description"),
  };
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
