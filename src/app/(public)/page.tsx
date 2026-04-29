"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RaffleCard } from "@/components/raffle/raffle-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/i18n/provider";

/* ── Data ── */

type Raffle = {
  id: string;
  title: string;
  slug: string;
  featuredImage: string;
  pricePerNumber: number;
  stats: { available: number; paid: number; total: number };
  status: "ACTIVE" | "PAUSED" | "DRAWN" | "CLOSED" | "CANCELLED";
  scheduledDrawAt: string | null;
  skinRarity: string;
  skinRarityColor: string;
  skinWear: string;
  skinWeapon: string;
};

/* ── Page ── */

export default function HomePage() {
  const { t } = useTranslation();
  const [featuredRaffles, setFeaturedRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);

  const STEPS = [
    {
      title: t("home.step1Title"),
      description: t("home.step1Desc"),
      icon: SearchIcon,
    },
    {
      title: t("home.step2Title"),
      description: t("home.step2Desc"),
      icon: CartIcon,
    },
    {
      title: t("home.step3Title"),
      description: t("home.step3Desc"),
      icon: TrophyIcon,
    },
  ];

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch("/api/raffles?limit=4");
        const json = await res.json();
        if (json.success && json.data?.data) {
          const mapped: Raffle[] = json.data.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            featuredImage: item.skinImage || item.featuredImage,
            pricePerNumber: Number(item.pricePerNumber),
            stats: item.stats || { available: 0, paid: 0, total: 0 },
            status: item.status,
            scheduledDrawAt: item.scheduledDrawAt || null,
            skinRarity: item.skinRarity || "",
            skinRarityColor: item.skinRarityColor || "",
            skinWear: item.skinWear || "",
            skinWeapon: item.skinWeapon || "",
          }));
          setFeaturedRaffles(mapped);
        }
      } catch (err) {
        console.error("Erro ao buscar rifas em destaque:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950 via-surface-950 to-surface-950" />

        {/* Decorative grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary-600/10 blur-[128px]" />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 py-28 text-center lg:py-40">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-gradient">{t("home.hero.title")}</span>
          </h1>

          <p className="max-w-2xl text-lg text-surface-400 sm:text-xl">
            {t("home.hero.subtitle")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/raffles"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary-600 px-8 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/30"
            >
              {t("home.hero.ctaRaffles")}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/about"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-surface-700 px-8 text-base font-semibold text-surface-300 transition-all hover:border-surface-500 hover:text-white"
            >
              {t("home.hero.ctaHowItWorks")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Raffles ── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold text-[var(--foreground)]">
            {t("home.featured.title")}
          </h2>
          <div className="mt-3 h-1 w-16 rounded-full bg-accent-500" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            ))}
          </div>
        ) : featuredRaffles.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredRaffles.map((raffle) => (
              <RaffleCard key={raffle.id} raffle={raffle} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] py-16 text-center">
            <svg className="h-12 w-12 text-[var(--muted-foreground)] mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
            </svg>
            <p className="text-lg font-semibold text-[var(--foreground)]">
              {t("home.noRaffles")}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {t("home.comeBackSoon")}
            </p>
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/raffles"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition-all hover:border-primary-600/40 hover:text-primary-500"
          >
            {t("home.viewAllRaffles")}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Discord CTA ── */}
      <DiscordCta />

      {/* ── How It Works ── */}
      <section className="border-y border-[var(--border)] bg-[var(--muted)]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="mb-12 flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold text-[var(--foreground)]">
              {t("home.howItWorksTitle")}
            </h2>
            <p className="mt-3 max-w-lg text-[var(--muted-foreground)]">
              {t("home.howItWorksSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="relative flex flex-col items-center rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-sm transition-all hover:shadow-md hover:border-primary-600/30"
              >
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white shadow-md shadow-primary-600/25">
                  {i + 1}
                </div>

                <div className="mt-2 mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-600/10 text-primary-500">
                  <step.icon />
                </div>

                <h3 className="text-lg font-bold text-[var(--foreground)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Icons ── */

function SearchIcon() {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.98 6.98 0 0 1-3.021 1.665m0 0a6.982 6.982 0 0 1-3.498 0m6.519-1.665L12 12.75M5.25 4.236 12 12.75" />
    </svg>
  );
}

// Permanent Discord invite — same env var as the footer. Hide the
// section entirely if the env isn't set so devs/preview deployments
// don't render a broken CTA.
function DiscordCta() {
  const invite = process.env.NEXT_PUBLIC_DISCORD_INVITE;
  if (!invite) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
      <div
        className="relative overflow-hidden rounded-2xl border border-[#5865F2]/30 p-6 sm:p-10"
        style={{
          background:
            "linear-gradient(135deg, rgba(88,101,242,0.18) 0%, rgba(124,58,237,0.18) 50%, rgba(251,191,36,0.10) 100%)",
        }}
      >
        {/* Decorative blurred glow */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[#5865F2]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent-500/15 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
          <div className="flex-shrink-0 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-[#5865F2] shadow-lg shadow-[#5865F2]/30">
            <svg viewBox="0 0 24 24" fill="white" className="h-12 w-12 sm:h-14 sm:w-14">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Junte-se à comunidade no Discord
            </h2>
            <p className="text-sm sm:text-base text-surface-300 max-w-xl mb-4 sm:mb-0">
              Sorteios em tempo real, anúncios de novas rifas, drops exclusivos e papo
              com outros caçadores de skin. Bem-vindo ao bando 🦆
            </p>
          </div>

          <a
            href={invite}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#5865F2] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-[#5865F2]/30 hover:bg-[#4752c4] hover:shadow-[#5865F2]/50 transition-all whitespace-nowrap"
          >
            Entrar no Discord
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
