import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { ConfirmProvider } from "@/components/providers/confirm-provider";
import { WinnerCelebrationProvider } from "@/components/providers/winner-celebration-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ahirudrop.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AhiruDrop — Rifas de Skins CS2 com Provably Fair",
    template: "%s | AhiruDrop",
  },
  description:
    "Rifas de skins de Counter-Strike 2 com sorteios 100% verificáveis via blockchain Bitcoin. AK-47, AWP, facas, luvas e muito mais.",
  keywords: [
    "rifas cs2", "rifas skins", "sorteio cs2", "counter-strike 2",
    "skins csgo", "ak-47", "awp", "karambit", "provably fair",
    "rifa online", "ahirudrop",
  ],
  authors: [{ name: "AhiruDrop" }],
  creator: "AhiruDrop",
  publisher: "AhiruDrop",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "AhiruDrop",
    title: "AhiruDrop — Rifas de Skins CS2",
    description:
      "Participe de rifas de skins CS2 com sorteios verificáveis publicamente via Bitcoin.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AhiruDrop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AhiruDrop — Rifas de Skins CS2",
    description:
      "Rifas de skins CS2 com provably fair. Transparente, justo e verificável.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning={true}
    >
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <ThemeProvider>
          <SessionProvider>
            <QueryProvider>
              <ToastProvider>
                <ConfirmProvider>
                  <WinnerCelebrationProvider>{children}</WinnerCelebrationProvider>
                </ConfirmProvider>
              </ToastProvider>
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
