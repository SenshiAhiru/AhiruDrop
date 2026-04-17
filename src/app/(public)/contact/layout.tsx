import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contato & Suporte",
  description: "Entre em contato com o suporte do AhiruDrop. Respondemos em até 24h úteis.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
