import Link from "next/link";
import { Ticket } from "lucide-react";

export default async function DrawResultPage({
  params,
}: {
  params: Promise<{ drawId: string }>;
}) {
  const { drawId } = await params;

  // TODO: fetch real result from API: /api/draws/${drawId}
  const result = null;

  if (!result) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <div className="flex justify-center">
          <Ticket className="mb-4 h-16 w-16 text-[var(--muted-foreground)] opacity-40" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Resultado nao encontrado
        </h1>
        <p className="mt-3 text-[var(--muted-foreground)]">
          O sorteio solicitado nao existe ou ainda nao foi realizado.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/raffles"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition-all hover:border-primary-600/40 hover:text-primary-500"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            Ver outras rifas
          </Link>
        </div>
      </div>
    );
  }
}
