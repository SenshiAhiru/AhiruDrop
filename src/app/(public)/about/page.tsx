import Link from "next/link";

const STEPS = [
  {
    number: "01",
    title: "Cadastre-se",
    description:
      "Crie sua conta em poucos segundos usando e-mail ou redes sociais. O processo e simples, rapido e seguro.",
    icon: UserPlusIcon,
  },
  {
    number: "02",
    title: "Escolha uma rifa",
    description:
      "Navegue pelo catalogo de rifas ativas. Veja detalhes do premio, quantidade de numeros, precos e datas de sorteio.",
    icon: SearchIcon,
  },
  {
    number: "03",
    title: "Escolha seus numeros",
    description:
      "Selecione seus numeros da sorte manualmente ou gere numeros aleatorios. Voce escolhe quantos quiser, dentro do limite por compra.",
    icon: GridIcon,
  },
  {
    number: "04",
    title: "Realize o pagamento",
    description:
      "Pague via PIX de forma instantanea e segura. Seu pagamento e confirmado em segundos e os numeros sao reservados automaticamente.",
    icon: CreditCardIcon,
  },
  {
    number: "05",
    title: "Aguarde o sorteio",
    description:
      "Acompanhe o progresso da rifa em tempo real. Voce sera notificado quando o sorteio estiver proximo e quando for realizado.",
    icon: ClockIcon,
  },
  {
    number: "06",
    title: "Confira o resultado",
    description:
      "Resultados publicos e transparentes. Todo sorteio gera um hash criptografico verificavel, garantindo total integridade.",
    icon: CheckCircleIcon,
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* Hero */}
      <div className="mb-16 text-center">
        <h1 className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
          Como Funciona o <span className="text-gradient">AhiruDrop</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted-foreground)]">
          Participar de uma rifa no AhiruDrop e simples, seguro e transparente.
          Confira o passo a passo completo.
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

      {/* CTA */}
      <div className="mt-20 flex flex-col items-center gap-6 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-primary-950/50 to-surface-900/50 p-10 text-center">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">
          Pronto para tentar a sorte?
        </h2>
        <p className="max-w-md text-[var(--muted-foreground)]">
          Explore as rifas disponiveis e escolha seus numeros da sorte.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/raffles"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary-600 px-8 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700"
          >
            Ver Rifas
          </Link>
          <Link
            href="/faq"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--border)] px-8 text-base font-semibold text-[var(--foreground)] transition-all hover:border-primary-600/40 hover:text-primary-500"
          >
            Perguntas Frequentes
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

function CreditCardIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
