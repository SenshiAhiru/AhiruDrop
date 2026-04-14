"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export function AhcBalance({ className }: { className?: string }) {
  const { data: session } = useSession();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    fetch("/api/user/balance")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.balance != null) {
          setBalance(Number(json.data.balance));
        }
      })
      .catch(() => {});
  }, [session?.user]);

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
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-surface-950 text-[10px] font-black">
        A
      </div>
      <span className="text-sm font-bold text-accent-400">
        {balance != null ? balance.toFixed(2) : "—"}
      </span>
      <span className="text-[10px] text-accent-500/70 font-medium">AHC</span>
    </Link>
  );
}
