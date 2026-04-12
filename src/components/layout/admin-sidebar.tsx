"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Ticket,
  ShoppingCart,
  Users,
  CreditCard,
  Settings2,
  Tag,
  Settings,
  BarChart3,
  MessageSquare,
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
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Rifas", href: "/admin/raffles", icon: Ticket },
  { label: "Pedidos", href: "/admin/orders", icon: ShoppingCart },
  { label: "Usuarios", href: "/admin/users", icon: Users },
  { label: "Pagamentos", href: "/admin/payments", icon: CreditCard },
  { label: "Gateways", href: "/admin/gateways", icon: Settings2 },
  { label: "Cupons", href: "/admin/coupons", icon: Tag },
  { label: "Configuracoes", href: "/admin/settings", icon: Settings },
  { label: "Relatorios", href: "/admin/reports", icon: BarChart3 },
  { label: "Suporte", href: "/admin/support", icon: MessageSquare },
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside
      className={cn(
        "w-64 h-screen bg-[var(--card)] border-r border-[var(--border)] flex flex-col fixed left-0 top-0",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-5 border-b border-[var(--border)] shrink-0">
        <a href="/">
          <Logo size="md" />
        </a>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <a
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
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="shrink-0 border-t border-[var(--border)] p-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center h-9 w-9 rounded-full bg-primary-600 text-white text-sm font-bold shrink-0">
            {session?.user?.name?.charAt(0).toUpperCase() ?? "A"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[var(--foreground)] truncate">
              {session?.user?.name ?? "Admin"}
            </p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-primary-600/10 text-primary-500">
              Admin
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
