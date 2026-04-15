"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import {
  LayoutDashboard,
  ShoppingCart,
  User,
  Bell,
  Coins,
  Trophy,
  MessageSquare,
} from "lucide-react";

const mobileNavItems = [
  { label: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
  { label: "Depositar AHC", href: "/dashboard/deposit", icon: Coins },
  { label: "Meus Pedidos", href: "/dashboard/orders", icon: ShoppingCart },
  { label: "Minhas Vitórias", href: "/dashboard/winnings", icon: Trophy },
  { label: "Suporte", href: "/dashboard/support", icon: MessageSquare },
  { label: "Perfil", href: "/dashboard/profile", icon: User },
  { label: "Notificações", href: "/dashboard/notifications", icon: Bell },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)]">
        {/* Desktop sidebar */}
        <DashboardSidebar className="hidden lg:flex" />

        {/* Mobile sidebar */}
        <MobileNav
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          items={mobileNavItems}
          title="Dashboard"
        />

        {/* Main content */}
        <div className="lg:ml-64 flex flex-col min-h-screen">
          <DashboardHeader onMenuToggle={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
  );
}
