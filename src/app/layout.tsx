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

export const metadata: Metadata = {
  title: {
    default: "AhiruDrop - Rifas Online Premium",
    template: "%s | AhiruDrop",
  },
  description:
    "Plataforma de rifas online com experiência premium, confiável e transparente.",
  keywords: ["rifas", "sorteios", "prêmios", "ahirudrop"],
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
