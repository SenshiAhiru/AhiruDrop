import type { Metadata } from "next";
import { getServerT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();
  return {
    title: t("meta.contact.title"),
    description: t("meta.contact.description"),
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
