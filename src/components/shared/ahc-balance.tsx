"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { usePoll } from "@/hooks/use-poll";

export function AhcBalance({ className }: { className?: string }) {
  const { data: session } = useSession();
  const [balance, setBalance] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/user/balance", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data?.balance != null) {
        setBalance(Number(json.data.balance));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (session?.user) refresh();
  }, [session?.user, refresh]);

  // Poll balance every 5s
  usePoll(refresh, 5000);

  if (!session?.user) return null;

  return (
    <Link
      href="/dashboard/deposit"
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-500/10 border border-accent-500/20 hover:bg-accent-500/20 transition-colors",
        className
      )}
      title="Adicionar AhiruCoins"
    >
      {/* AHC icon */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/ahc-coin.png" alt="AHC" className="h-6 w-6 rounded-full" />
      <span className="text-sm font-bold text-accent-400">
        {balance != null ? balance.toFixed(2) : "—"}
      </span>
      <span className="text-[10px] text-accent-500/70 font-medium">AHC</span>
    </Link>
  );
}
