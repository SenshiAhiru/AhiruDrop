"use client";

import { Menu } from "lucide-react";
import { UserMenu } from "@/components/shared/user-menu";
import { AhcBalance } from "@/components/shared/ahc-balance";
import { NotificationBell } from "@/components/shared/notification-bell";

interface AdminHeaderProps {
  title?: string;
  onMenuToggle?: () => void;
}

export function AdminHeader({ title, onMenuToggle }: AdminHeaderProps) {
  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-surface-400 hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        {title && (
          <h1 className="text-lg font-semibold text-[var(--foreground)]">{title}</h1>
        )}
      </div>
      <div className="flex items-center gap-2">
        <AhcBalance />
        <NotificationBell href="/admin/notifications" />
        <UserMenu />
      </div>
    </header>
  );
}
