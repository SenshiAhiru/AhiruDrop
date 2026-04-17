import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perguntas Frequentes",
  description:
    "Respostas para as dúvidas mais comuns sobre rifas, sorteios, AhiruCoins e entrega de skins.",
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
