"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { usePoll } from "@/hooks/use-poll";

interface Props {
  href?: string;
  className?: string;
}

/**
 * Bell icon with unread-count badge. Polls /api/user/notifications/count
 * every 15 seconds while the tab is visible.
 */
export function NotificationBell({ href = "/dashboard/notifications", className }: Props) {
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/user/notifications/count", { cache: "no-store" });
      const json = await res.json();
      if (json.success) setUnread(json.data.unread ?? 0);
    } catch {
      // silent
    }
  }, []);

  usePoll(refresh, 15000);

  return (
    <Link
      href={href}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors ${
        className ?? ""
      }`}
      aria-label="Notificações"
    >
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
