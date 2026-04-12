"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, Bell, LogOut, User, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  title?: string;
  onMenuToggle?: () => void;
}

export function AdminHeader({ title, onMenuToggle }: AdminHeaderProps) {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = () => setDropdownOpen(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [dropdownOpen]);

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
        {title && (
          <h1 className="text-lg font-semibold text-[var(--foreground)]">{title}</h1>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-surface-400 hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          aria-label="Notificacoes"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger" />
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen((prev) => !prev);
            }}
            className="flex items-center gap-2 p-2 rounded-lg text-sm font-medium text-surface-400 hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-600 text-white text-xs font-bold">
              {session?.user?.name?.charAt(0).toUpperCase() ?? "A"}
            </span>
            <span className="hidden sm:inline max-w-[120px] truncate">
              {session?.user?.name ?? "Admin"}
            </span>
            <ChevronDown className="h-4 w-4 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xl py-1 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <a
                href="/dashboard/profile"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-surface-400 hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                <User className="h-4 w-4" />
                Perfil
              </a>
              <hr className="border-[var(--border)] my-1" />
              <a
                href="/api/auth/signout"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-[var(--muted)] transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
