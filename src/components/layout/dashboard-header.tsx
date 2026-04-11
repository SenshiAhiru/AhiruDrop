"use client";

import { useSession } from "next-auth/react";
import { Menu, Bell } from "lucide-react";

interface DashboardHeaderProps {
  onMenuToggle?: () => void;
}

export function DashboardHeader({ onMenuToggle }: DashboardHeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between px-4 lg:px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-surface-400 hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-[var(--foreground)]">Minha Conta</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-surface-400 hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          aria-label="Notificacoes"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-600 text-white text-xs font-bold">
            {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
          </span>
          <span className="hidden sm:inline text-sm font-medium text-[var(--foreground)] max-w-[120px] truncate">
            {session?.user?.name ?? "Usuario"}
          </span>
        </div>
      </div>
    </header>
  );
}
