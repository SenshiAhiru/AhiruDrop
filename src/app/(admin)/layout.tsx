"use client";

import { useState } from "react";
import { SessionProvider } from "@/components/providers/session-provider";
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
} from "lucide-react";

const mobileNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Rifas", href: "/admin/raffles", icon: Ticket },
  { label: "Pedidos", href: "/admin/orders", icon: ShoppingCart },
  { label: "Usuários", href: "/admin/users", icon: Users },
  { label: "Pagamentos", href: "/admin/payments", icon: CreditCard },
  { label: "Gateways", href: "/admin/gateways", icon: Settings2 },
  { label: "Cupons", href: "/admin/coupons", icon: Tag },
  { label: "Configurações", href: "/admin/settings", icon: Settings },
  { label: "Relatórios", href: "/admin/reports", icon: BarChart3 },
  { label: "Suporte", href: "/admin/support", icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SessionProvider>
      <div className="min-h-screen bg-[var(--background)]">
        {/* Desktop sidebar */}
        <AdminSidebar className="hidden lg:flex" />

        {/* Mobile sidebar */}
        <MobileNav
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          items={mobileNavItems}
          title="Admin"
        />

        {/* Main content */}
        <div className="lg:ml-64 flex flex-col min-h-screen">
          <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
