"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusMap: Record<string, { label: string; variant: "success" | "warning" | "accent" | "danger" | "outline" }> = {
  ACTIVE: { label: "Ativa", variant: "success" },
  PAUSED: { label: "Pausada", variant: "warning" },
  DRAWN: { label: "Sorteada", variant: "accent" },
  CLOSED: { label: "Encerrada", variant: "outline" },
  CANCELLED: { label: "Cancelada", variant: "danger" },
};

export default function RaffleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  // TODO: Replace with real data fetching
  const raffle = null;

  if (!raffle) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] py-20 text-center">
          <svg
            className="h-16 w-16 text-[var(--muted-foreground)] mb-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Rifa nao encontrada
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            A rifa que voce procura nao existe ou foi removida.
          </p>
          <Link href="/raffles">
            <Button variant="outline" className="mt-6">
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Voltar para rifas
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}
