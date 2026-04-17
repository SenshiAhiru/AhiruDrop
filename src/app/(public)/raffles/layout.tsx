import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rifas de Skins CS2",
  description:
    "Explore todas as rifas de skins de Counter-Strike 2 disponíveis. Armas, facas, luvas e muito mais com sorteios provably fair.",
  openGraph: {
    title: "Rifas de Skins CS2 — AhiruDrop",
    description: "Participe de rifas de skins CS2 com sorteios verificáveis.",
  },
};

export default function RafflesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
