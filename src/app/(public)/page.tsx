import Link from "next/link";
import { RaffleCard } from "@/components/raffle/raffle-card";

/* ── Mock Data ── */

const FEATURED_RAFFLES = [
  {
    id: "1",
    title: "AK-47 | Asiimov (Field-Tested)",
    slug: "ak47-asiimov-ft",
    featuredImage: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXp-K9FDG6SUIOYyJz_BlO9RkbaYMhk/",
    pricePerNumber: 2.50,
    stats: { available: 720, paid: 280, total: 1000 },
    status: "ACTIVE" as const,
    scheduledDrawAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    skinRarity: "Classified",
    skinRarityColor: "#d32ce6",
    skinWear: "Field-Tested",
    skinWeapon: "AK-47",
  },
  {
    id: "2",
    title: "Karambit | Doppler (Factory New)",
    slug: "karambit-doppler-fn",
    featuredImage: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXp-K9FDG6SUIOYyJz_BlO9RkbaYMhk/",
    pricePerNumber: 10.00,
    stats: { available: 150, paid: 850, total: 1000 },
    status: "ACTIVE" as const,
    scheduledDrawAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    skinRarity: "Covert",
    skinRarityColor: "#eb4b4b",
    skinWear: "Factory New",
    skinWeapon: "Karambit",
  },
  {
    id: "3",
    title: "AWP | Dragon Lore (Minimal Wear)",
    slug: "awp-dragon-lore-mw",
    featuredImage: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXp-K9FDG6SUIOYyJz_BlO9RkbaYMhk/",
    pricePerNumber: 25.00,
    stats: { available: 5000, paid: 5000, total: 10000 },
    status: "DRAWN" as const,
    scheduledDrawAt: null,
    skinRarity: "Covert",
    skinRarityColor: "#eb4b4b",
    skinWear: "Minimal Wear",
    skinWeapon: "AWP",
  },
  {
    id: "4",
    title: "Sport Gloves | Pandora's Box (Minimal Wear)",
    slug: "sport-gloves-pandoras-box-mw",
    featuredImage: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXp-K9FDG6SUIOYyJz_BlO9RkbaYMhk/",
    pricePerNumber: 5.00,
    stats: { available: 300, paid: 200, total: 500 },
    status: "ACTIVE" as const,
    scheduledDrawAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    skinRarity: "Extraordinary",
    skinRarityColor: "#e4ae39",
    skinWear: "Minimal Wear",
    skinWeapon: "Sport Gloves",
  },
];

const STATS = [
  { label: "Rifas Realizadas", value: "1.250+", icon: TicketIcon },
  { label: "Premios Entregues", value: "R$ 2.8M", icon: GiftIcon },
  { label: "Usuarios Ativos", value: "45.000+", icon: UsersIcon },
  { label: "Transparencia", value: "100%", icon: ShieldIcon },
];

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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_RAFFLES.map((raffle) => (
            <RaffleCard key={raffle.id} raffle={raffle} />
          ))}
        </div>

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

      {/* ── Stats / Trust ── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600/10 text-primary-500">
                <stat.icon />
              </div>
              <span className="text-2xl font-bold text-[var(--foreground)] lg:text-3xl">
                {stat.value}
              </span>
              <span className="text-sm text-[var(--muted-foreground)]">
                {stat.label}
              </span>
            </div>
          ))}
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

function TicketIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}
