"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  User,
  LogOut,
  ChevronDown,
  Shield,
  LayoutDashboard,
  ShoppingCart,
  Bell,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  if (!session?.user) return null;

  const isAdmin =
    (session.user as any).role === "ADMIN" ||
    (session.user as any).role === "SUPER_ADMIN";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-2 rounded-lg text-sm font-medium text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
      >
        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-600 text-white text-xs font-bold">
          {session.user.name?.charAt(0).toUpperCase() ?? "U"}
        </span>
        <span className="hidden sm:inline max-w-[120px] truncate">
          {session.user.name}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 hidden sm:block transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-surface-900 border border-surface-700 shadow-2xl py-2 z-50">
            {/* User info */}
            <div className="px-4 py-2 border-b border-surface-700 mb-1">
              <p className="text-sm font-medium text-white truncate">
                {session.user.name}
              </p>
              <p className="text-xs text-surface-400 truncate">
                {session.user.email}
              </p>
            </div>

            {/* Navigation */}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
            >
              <Home className="h-4 w-4" />
              Início
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Minha Conta
            </Link>

            <Link
              href="/dashboard/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              Meus Pedidos
            </Link>

            <Link
              href="/dashboard/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
            >
              <User className="h-4 w-4" />
              Perfil
            </Link>

            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
            >
              <Bell className="h-4 w-4" />
              Notificações
            </Link>

            {isAdmin && (
              <>
                <hr className="border-surface-700 my-1" />
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-accent-500 hover:bg-surface-800 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  Painel Admin
                </Link>
              </>
            )}

            <hr className="border-surface-700 my-1" />
            <a
              href="/api/auth/signout"
              className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-surface-800 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </a>
          </div>
        </>
      )}
    </div>
  );
}
