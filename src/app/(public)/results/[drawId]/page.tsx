import Link from "next/link";
import { Badge } from "@/components/ui/badge";

/* ── Mock data ── */

function getMockResult(drawId: string) {
  return {
    drawId,
    raffle: {
      id: "1",
      title: "PlayStation 5 Slim Digital Edition",
      slug: "playstation-5-slim-digital",
      totalNumbers: 1000,
      pricePerNumber: 2.5,
      category: "Eletronicos",
    },
    winningNumber: 427,
    winner: {
      name: "Thi***  S***",
      location: "Sao Paulo, SP",
    },
    verification: {
      hash: "a3f8c2d1e5b94f07d6e3a1c8b2f4d5e6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
      seed: "ahirudrop-2026-04-10-ps5-slim-digital-1000",
      timestamp: "2026-04-10T20:00:00Z",
      algorithm: "SHA-256",
    },
    drawnAt: "2026-04-10T20:00:03Z",
  };
}

export default async function DrawResultPage({
  params,
}: {
  params: Promise<{ drawId: string }>;
}) {
  const { drawId } = await params;
  const result = getMockResult(drawId);

  const drawnDate = new Date(result.drawnAt);
  const formattedDate = drawnDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Header */}
      <div className="mb-10 text-center">
        <Badge variant="accent" className="mb-4 text-sm px-4 py-1">
          Sorteio Realizado
        </Badge>
        <h1 className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
          Resultado do Sorteio
        </h1>
        <p className="mt-3 text-[var(--muted-foreground)]">{formattedDate}</p>
      </div>

      {/* Raffle info */}
      <div className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-600/10 text-primary-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              {result.raffle.title}
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              {result.raffle.totalNumbers} numeros &middot; {result.raffle.category}
            </p>
          </div>
        </div>
      </div>

      {/* Winning number */}
      <div className="mb-8 flex flex-col items-center rounded-2xl border border-accent-500/30 bg-gradient-to-br from-accent-500/5 to-primary-600/5 p-10">
        <p className="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Numero Sorteado
        </p>
        <div className="mt-4 flex h-28 w-28 items-center justify-center rounded-2xl bg-accent-500 shadow-xl shadow-accent-500/25">
          <span className="text-5xl font-extrabold text-surface-900 font-mono">
            {String(result.winningNumber).padStart(3, "0")}
          </span>
        </div>
      </div>

      {/* Winner */}
      <div className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Ganhador
        </p>
        <p className="mt-2 text-xl font-bold text-[var(--foreground)]">
          {result.winner.name}
        </p>
        <p className="text-sm text-[var(--muted-foreground)]">{result.winner.location}</p>
      </div>

      {/* Verification */}
      <div className="mb-10 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h3 className="mb-4 text-lg font-bold text-[var(--foreground)]">
          Verificacao do Sorteio
        </h3>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              Algoritmo
            </p>
            <p className="mt-1 text-sm font-mono text-[var(--foreground)]">
              {result.verification.algorithm}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              Seed
            </p>
            <p className="mt-1 break-all rounded-lg bg-[var(--muted)] p-3 text-sm font-mono text-[var(--foreground)]">
              {result.verification.seed}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              Hash do Resultado
            </p>
            <p className="mt-1 break-all rounded-lg bg-[var(--muted)] p-3 text-sm font-mono text-[var(--foreground)]">
              {result.verification.hash}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              Timestamp
            </p>
            <p className="mt-1 text-sm font-mono text-[var(--foreground)]">
              {result.verification.timestamp}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-primary-600/20 bg-primary-600/5 p-4">
          <h4 className="text-sm font-semibold text-[var(--foreground)]">
            Como verificar o resultado
          </h4>
          <p className="mt-2 text-xs leading-relaxed text-[var(--muted-foreground)]">
            O numero sorteado e determinado aplicando o algoritmo {result.verification.algorithm}{" "}
            sobre o seed publico combinado com o timestamp do sorteio. O resultado gera o hash
            exibido acima. Qualquer pessoa pode recalcular o hash utilizando as mesmas entradas
            e confirmar que o resultado nao foi alterado.
          </p>
        </div>
      </div>

      {/* Back link */}
      <div className="flex justify-center">
        <Link
          href="/raffles"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition-all hover:border-primary-600/40 hover:text-primary-500"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Ver outras rifas
        </Link>
      </div>
    </div>
  );
}
