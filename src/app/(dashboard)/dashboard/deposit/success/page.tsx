"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { AhcCoin } from "@/components/shared/ahc-coin";

function SuccessContent() {
  const params = useSearchParams();
  const amount = params.get("amount") || "0";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
        <CheckCircle className="h-10 w-10 text-success" />
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">Depósito realizado!</h1>
      <p className="text-surface-400 mb-4">
        Seu saldo foi creditado com sucesso.
      </p>

      <div className="flex items-center gap-2 mb-8">
        <AhcCoin size={32} />
        <span className="text-3xl font-bold text-accent-400">+{amount} AHC</span>
      </div>

      <div className="flex gap-3">
        <Link
          href="/dashboard/deposit"
          className="rounded-lg border border-surface-700 px-6 py-2.5 text-sm font-medium text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
        >
          Depositar mais
        </Link>
        <Link
          href="/raffles"
          className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
        >
          Ver rifas
        </Link>
      </div>
    </div>
  );
}

export default function DepositSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
