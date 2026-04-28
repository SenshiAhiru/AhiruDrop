"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";
import { MobileNav } from "@/components/layout/mobile-nav";
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
  Activity,
  Bell,
  ArrowRightLeft,
} from "lucide-react";

const mobileNavItems = [
  // `exact` keeps "Dashboard" from highlighting on every /admin/* route
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Rifas", href: "/admin/raffles", icon: Ticket },
  { label: "Pedidos", href: "/admin/orders", icon: ShoppingCart },
  { label: "Usuários", href: "/admin/users", icon: Users },
  { label: "Pagamentos", href: "/admin/payments", icon: CreditCard },
  { label: "Gateways", href: "/admin/gateways", icon: Settings2 },
  { label: "Trades", href: "/admin/trades", icon: ArrowRightLeft },
  { label: "Cupons", href: "/admin/coupons", icon: Tag },
  { label: "Configurações", href: "/admin/settings", icon: Settings },
  { label: "Relatórios", href: "/admin/reports", icon: BarChart3 },
  { label: "Auditoria", href: "/admin/audit", icon: Activity },
  { label: "Suporte", href: "/admin/support", icon: MessageSquare },
  { label: "Notificações", href: "/admin/notifications", icon: Bell },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminSidebar className="hidden lg:flex" />
      <MobileNav
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        items={mobileNavItems}
        title="Admin"
      >
        {/* Mirror the desktop sidebar's user card so admins always
            know which account they're acting on. */}
        {session?.user && (
          <div className="flex items-center gap-3">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt=""
                width={36}
                height={36}
                unoptimized
                className="rounded-full object-cover shrink-0"
              />
            ) : (
              <span className="flex items-center justify-center h-9 w-9 rounded-full bg-primary-600 text-white text-sm font-bold shrink-0">
                {session.user.name?.charAt(0).toUpperCase() ?? "A"}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--foreground)] truncate">
                {session.user.name ?? "Admin"}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-primary-600/10 text-primary-500">
                Admin
              </span>
            </div>
          </div>
        )}
      </MobileNav>
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
