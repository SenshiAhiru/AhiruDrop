import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Como Funciona",
  description:
    "Entenda como funcionam as rifas no AhiruDrop: da compra do ticket ao sorteio provably fair via Bitcoin.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
