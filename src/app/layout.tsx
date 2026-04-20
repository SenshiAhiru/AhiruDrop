import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { ConfirmProvider } from "@/components/providers/confirm-provider";
import { WinnerCelebrationProvider } from "@/components/providers/winner-celebration-provider";
import { OnboardingProvider } from "@/components/providers/onboarding-provider";
import { I18nProvider } from "@/i18n/provider";
import { detectLocaleFromAcceptLanguage } from "@/i18n/detect";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES } from "@/i18n/types";
import type { Locale } from "@/i18n/types";

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

async function resolveInitialLocale(): Promise<Locale> {
  // 1st priority: explicit cookie (user preference)
  const cookieStore = await cookies();
  const cookieVal = cookieStore.get(LOCALE_COOKIE)?.value as Locale | undefined;
  if (cookieVal && LOCALES.includes(cookieVal)) return cookieVal;

  // 2nd: Accept-Language header (auto-detect)
  const headerStore = await headers();
  const fromHeader = detectLocaleFromAcceptLanguage(headerStore.get("accept-language"));
  if (fromHeader) return fromHeader;

  return DEFAULT_LOCALE;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialLocale = await resolveInitialLocale();
  const htmlLang = initialLocale === "pt" ? "pt-BR" : "en-US";

  return (
    <html
      lang={htmlLang}
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning={true}
    >
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <ThemeProvider>
          <I18nProvider initialLocale={initialLocale}>
            <SessionProvider>
              <QueryProvider>
                <ToastProvider>
                  <ConfirmProvider>
                    <WinnerCelebrationProvider>
                      <OnboardingProvider>{children}</OnboardingProvider>
                    </WinnerCelebrationProvider>
                  </ConfirmProvider>
                </ToastProvider>
              </QueryProvider>
            </SessionProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
