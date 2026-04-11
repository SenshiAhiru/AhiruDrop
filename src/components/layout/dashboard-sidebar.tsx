"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  User,
  Bell,
  ArrowLeft,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: "Visao Geral", href: "/dashboard", icon: LayoutDashboard },
  { label: "Meus Pedidos", href: "/dashboard/orders", icon: ShoppingCart },
  { label: "Perfil", href: "/dashboard/profile", icon: User },
  { label: "Notificacoes", href: "/dashboard/notifications", icon: Bell },
];

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-64 h-screen bg-[var(--card)] border-r border-[var(--border)] flex flex-col fixed left-0 top-0",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-5 border-b border-[var(--border)] shrink-0">
        <Link href="/dashboard">
          <Logo size="md" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                    isActive
                      ? "bg-primary-600/10 text-primary-500"
                      : "text-surface-400 hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                  )}
                >
                  {isActive && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary-500 rounded-l" />
                  )}
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom actions */}
      <div className="shrink-0 border-t border-[var(--border)] p-3 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-400 hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
        >
          <ArrowLeft className="h-5 w-5 shrink-0" />
          Voltar ao site
        </Link>
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-[var(--muted)] transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sair
        </Link>
      </div>
    </aside>
  );
}
