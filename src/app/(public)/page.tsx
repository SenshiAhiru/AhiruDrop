import Link from "next/link";
import { RaffleCard } from "@/components/raffle/raffle-card";

/* ── Data ── */

const FEATURED_RAFFLES: {
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
}[] = [];

const STEPS = [
  {
    title: "Escolha sua skin",
    description: "Navegue pelo catalogo e encontre a skin dos seus sonhos.",
    icon: SearchIcon,
  },
  {
    title: "Compre seus numeros",
    description: "Selecione manualmente ou gere numeros aleatorios com facilidade.",
    icon: CartIcon,
  },
  {
    title: "Aguarde o sorteio",
    description: "Acompanhe em tempo real e receba sua skin direto no inventario.",
    icon: TrophyIcon,
  },
];

/* ── Page ── */

export default function HomePage() {
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
            <span className="text-gradient">Skins raras ao seu alcance</span>
          </h1>

          <p className="max-w-2xl text-lg text-surface-400 sm:text-xl">
            Participe das melhores rifas de skins CS2. Armas, facas e luvas com
            transparencia total.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/raffles"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary-600 px-8 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/30"
            >
              Ver Rifas
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/about"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-surface-700 px-8 text-base font-semibold text-surface-300 transition-all hover:border-surface-500 hover:text-white"
            >
              Como Funciona
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Raffles ── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold text-[var(--foreground)]">
            Rifas em Destaque
          </h2>
          <div className="mt-3 h-1 w-16 rounded-full bg-accent-500" />
        </div>

        {FEATURED_RAFFLES.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_RAFFLES.map((raffle) => (
              <RaffleCard key={raffle.id} raffle={raffle} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] py-16 text-center">
            <svg className="h-12 w-12 text-[var(--muted-foreground)] mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
            </svg>
            <p className="text-lg font-semibold text-[var(--foreground)]">
              Nenhuma rifa disponivel no momento.
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Volte em breve!
            </p>
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/raffles"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition-all hover:border-primary-600/40 hover:text-primary-500"
          >
            Ver todas as rifas
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="border-y border-[var(--border)] bg-[var(--muted)]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="mb-12 flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold text-[var(--foreground)]">
              Como Funciona
            </h2>
            <p className="mt-3 max-w-lg text-[var(--muted-foreground)]">
              Participar e simples, rapido e seguro.
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
