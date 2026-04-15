"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  WinnerCelebrationPopup,
  type UnseenWin,
} from "@/components/shared/winner-celebration";

/**
 * On mount (if logged in), checks for unseen wins.
 * Shows a celebration popup for each one sequentially.
 * After user closes, marks as seen via API.
 */
export function WinnerCelebrationProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [queue, setQueue] = useState<UnseenWin[]>([]);
  const [current, setCurrent] = useState<UnseenWin | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/user/wins/unseen", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && json.success && Array.isArray(json.data.data) && json.data.data.length > 0) {
          const wins = json.data.data as UnseenWin[];
          setCurrent(wins[0]);
          setQueue(wins.slice(1));
        }
      } catch {
        // silent — don't break the page for a popup
      }
    }

    // Small delay so the page renders first
    const t = setTimeout(check, 1500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [status, session?.user?.id]);

  async function handleClose() {
    if (!current) return;

    // Mark as seen (fire-and-forget)
    try {
      await fetch(`/api/user/wins/${current.id}/seen`, { method: "PATCH" });
    } catch {
      // if fails, popup will show again next visit — acceptable
    }

    // Show next in queue, or close
    if (queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((prev) => prev.slice(1));
    } else {
      setCurrent(null);
    }
  }

  return (
    <>
      {children}
      {current && <WinnerCelebrationPopup win={current} onClose={handleClose} />}
    </>
  );
}
