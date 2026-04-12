import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-20 text-center">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary-600/5 blur-[100px]" />
      </div>

      <div className="relative space-y-6">
        {/* 404 number */}
        <h1 className="text-8xl font-extrabold tracking-tighter sm:text-9xl">
          <span className="text-gradient">404</span>
        </h1>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            Página não encontrada
          </h2>
          <p className="mx-auto max-w-md text-[var(--muted-foreground)]">
            A página que você está procurando não existe ou foi movida.
            Verifique o endereço ou volte ao início.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary-600 px-8 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
