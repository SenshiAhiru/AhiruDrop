export const siteConfig = {
  name: "AhiruDrop",
  description: "Plataforma de rifas online premium",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/images/og.png",
  links: {
    instagram: "#",
    discord: "#",
  },
  reservationTimeoutMinutes: 15,
  defaultCurrency: "BRL",
  defaultLocale: "pt-BR",
};
