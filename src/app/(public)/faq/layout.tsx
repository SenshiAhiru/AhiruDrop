import type { Metadata } from "next";
import { getServerT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();
  return {
    title: t("meta.faq.title"),
    description: t("meta.faq.description"),
  };
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
