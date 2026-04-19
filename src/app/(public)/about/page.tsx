import Link from "next/link";

const STEPS = [
  {
    number: "01",
    title: "Crie sua conta",
    description:
      "Cadastre-se em segundos usando e-mail e senha, ou entre direto com sua conta Steam. Você precisa ser maior de 18 anos.",
    icon: UserPlusIcon,
  },
  {
    number: "02",
    title: "Deposite AhiruCoins (AHC)",
    description:
      "AHC é a moeda interna da plataforma: 1 BRL = 1 AHC. Deposite via cartão de crédito (Stripe), em BRL, USD, EUR ou GBP. Tem cupom? Aplica na hora e ganha AHC bônus.",
    icon: CoinIcon,
  },
  {
    number: "03",
    title: "Escolha uma skin CS2",
    description:
      "Navegue pelas rifas ativas de skins de Counter-Strike 2 — AK-47, AWP, facas, luvas e mais. Veja raridade, wear, float e preço por cota.",
    icon: SearchIcon,
  },
  {
    number: "04",
    title: "Compre seus números",
    description:
      "Selecione os números manualmente ou gera 5/10 aleatórios. A compra é instantânea: debita do seu saldo AHC e os números ficam seus na hora — sem janela de reserva, sem pagar duas vezes.",
    icon: GridIcon,
  },
  {
    number: "05",
    title: "Aguarde o sorteio Provably Fair",
    description:
      "Usamos commit-reveal com hash de bloco do Bitcoin + server seed publicado antes da rifa. Qualquer pessoa pode verificar que o resultado não foi manipulado — página de verificação pública em /raffles/[rifa]/verify.",
    icon: ShieldIcon,
  },
  {
    number: "06",
    title: "Ganhou? Informe sua Steam Trade URL",
    description:
      "Se o seu número foi sorteado, acesse Minhas Vitórias no dashboard e cole sua Steam Trade URL. Um popup de celebração aparece na sua primeira visita após o sorteio.",
    icon: TrophyIcon,
  },
  {
    number: "07",
    title: "Receba a skin na Steam",
    description:
      "Nossa equipe envia a trade offer direto pra sua conta Steam. Você aceita no cliente/app e a skin vai pro seu inventário. O status da entrega fica visível em tempo real no dashboard.",
    icon: PackageIcon,
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* Hero */}
      <div className="mb-16 text-center">
        <h1 className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
          Como funciona o <span className="text-gradient">AhiruDrop</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted-foreground)]">
          Rifas de skins CS2 com sorteios 100% verificáveis via Bitcoin. Do cadastro ao
          recebimento da skin, em 7 passos.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary-600 via-primary-600/50 to-transparent md:block" />

        <div className="space-y-12 md:space-y-0">
          {STEPS.map((step, i) => {
            const isEven = i % 2 === 0;

            return (
              <div
                key={step.number}
                className="relative md:flex md:items-center md:py-8"
              >
                {/* Center dot (desktop) */}
                <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[var(--background)] bg-primary-600 text-sm font-bold text-white shadow-lg shadow-primary-600/25">
                    {step.number}
                  </div>
                </div>

                {/* Content card - alternating sides */}
                <div
                  className={`w-full md:w-[calc(50%-3rem)] ${
                    isEven ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"
                  }`}
                >
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm transition-all hover:shadow-md hover:border-primary-600/30">
                    {/* Mobile step number */}
                    <div className="mb-4 flex items-center gap-3 md:hidden">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white shadow-sm shadow-primary-600/25">
                        {step.number}
                      </div>
                      <h3 className="text-lg font-bold text-[var(--foreground)]">
                        {step.title}
                      </h3>
                    </div>

                    {/* Desktop icon + title */}
                    <div className="hidden items-center gap-3 md:flex">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-600/10 text-primary-500">
                        <step.icon />
                      </div>
                      <h3 className="text-lg font-bold text-[var(--foreground)]">
                        {step.title}
                      </h3>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)] md:ml-15">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Highlights */}
      <div className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <ShieldIcon />
          </div>
          <h3 className="font-bold text-[var(--foreground)]">Provably Fair</h3>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Sorteios ancorados na blockchain do Bitcoin. Ninguém, nem o AhiruDrop, consegue prever ou alterar o resultado.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <CoinIcon />
          </div>
          <h3 className="font-bold text-[var(--foreground)]">AHC com bônus</h3>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Moeda interna 1:1 com BRL. Cupons dão bônus de AHC na hora do depósito. Saldo nunca expira.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10 text-primary-400">
            <PackageIcon />
          </div>
          <h3 className="font-bold text-[var(--foreground)]">Entrega pela Steam</h3>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Ganhou? A skin vai direto pro seu inventário via trade offer oficial. Sem endereço, sem correios, sem espera.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-20 flex flex-col items-center gap-6 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-primary-950/50 to-surface-900/50 p-10 text-center">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">
          Pronto para tentar a sorte?
        </h2>
        <p className="max-w-md text-[var(--muted-foreground)]">
          Explore as rifas ativas de skins CS2 e escolha seus números da sorte.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/raffles"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary-600 px-8 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700"
          >
            Ver rifas
          </Link>
          <Link
            href="/faq"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--border)] px-8 text-base font-semibold text-[var(--foreground)] transition-all hover:border-primary-600/40 hover:text-primary-500"
          >
            Perguntas frequentes
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Icons ── */

function UserPlusIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
    </svg>
  );
}

function CoinIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m7.5 7.5-3.75 3.75m0 0 3.75 3.75m-3.75-3.75h16.5m-4.5-6L12 3m0 0-3.75 3.75M12 3v18" />
    </svg>
  );
}
