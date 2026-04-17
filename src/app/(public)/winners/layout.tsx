import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hall dos Ganhadores",
  description:
    "Veja todos os sorteios já realizados no AhiruDrop. Cada um com prova pública de integridade via Bitcoin.",
  openGraph: {
    title: "Hall dos Ganhadores — AhiruDrop",
    description: "Histórico transparente de todos os sorteios realizados.",
  },
};

export default function WinnersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
