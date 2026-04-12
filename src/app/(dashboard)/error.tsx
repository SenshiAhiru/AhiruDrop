"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-20 text-center">
      <div className="rounded-2xl bg-danger/10 p-4 mb-6">
        <svg className="h-8 w-8 text-danger" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
        Algo deu errado
      </h2>
      <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-md">
        Ocorreu um erro inesperado ao carregar esta página.
        Tente novamente ou volte ao início.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
        >
          Tentar novamente
        </button>
        <a
          href="/"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-6 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
        >
          Voltar ao início
        </a>
      </div>
    </div>
  );
}
