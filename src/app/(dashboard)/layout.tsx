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
import { useTranslation } from "@/i18n/provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mobileNavItems = [
    // exact: only highlight on /dashboard, not on every /dashboard/* route
    { label: t("dashboard.overview"), href: "/dashboard", icon: LayoutDashboard, exact: true },
    { label: t("dashboard.depositAhc"), href: "/dashboard/deposit", icon: Coins },
    { label: t("dashboard.myOrders"), href: "/dashboard/orders", icon: ShoppingCart },
    { label: t("dashboard.myWins"), href: "/dashboard/winnings", icon: Trophy },
    { label: t("dashboard.support"), href: "/dashboard/support", icon: MessageSquare },
    { label: t("dashboard.profile"), href: "/dashboard/profile", icon: User },
    { label: t("dashboard.notifications"), href: "/dashboard/notifications", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
        {/* Desktop sidebar */}
        <DashboardSidebar className="hidden lg:flex" />

        {/* Mobile sidebar */}
        <MobileNav
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          items={mobileNavItems}
          title={t("nav.dashboard")}
        />

        {/* Main content */}
        <div className="lg:ml-64 flex flex-col min-h-screen">
          <DashboardHeader onMenuToggle={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
  );
}
