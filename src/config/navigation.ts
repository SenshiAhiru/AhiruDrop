import { ROUTES } from "@/constants/routes";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export const publicNav: NavItem[] = [
  { label: "Home", href: ROUTES.HOME, icon: "Home" },
  { label: "Rifas", href: ROUTES.RAFFLES, icon: "Ticket" },
  { label: "Como Funciona", href: ROUTES.HOW_IT_WORKS, icon: "HelpCircle" },
  { label: "FAQ", href: ROUTES.FAQ, icon: "MessageCircleQuestion" },
];

export const dashboardNav: NavItem[] = [
  { label: "Visao Geral", href: ROUTES.DASHBOARD, icon: "LayoutDashboard" },
  { label: "Meus Pedidos", href: ROUTES.DASHBOARD_ORDERS, icon: "ShoppingBag" },
  { label: "Perfil", href: ROUTES.DASHBOARD_PROFILE, icon: "User" },
  { label: "Notificacoes", href: ROUTES.DASHBOARD_NOTIFICATIONS, icon: "Bell" },
];

export const adminNav: NavItem[] = [
  { label: "Dashboard", href: ROUTES.ADMIN, icon: "BarChart3" },
  { label: "Rifas", href: ROUTES.ADMIN_RAFFLES, icon: "Ticket" },
  { label: "Pedidos", href: ROUTES.ADMIN_ORDERS, icon: "ShoppingCart" },
  { label: "Usuarios", href: ROUTES.ADMIN_USERS, icon: "Users" },
  { label: "Pagamentos", href: ROUTES.ADMIN_PAYMENTS, icon: "CreditCard" },
  { label: "Gateways", href: ROUTES.ADMIN_GATEWAYS, icon: "Plug" },
  { label: "Cupons", href: ROUTES.ADMIN_COUPONS, icon: "Tag" },
  { label: "Configuracoes", href: ROUTES.ADMIN_SETTINGS, icon: "Settings" },
  { label: "Relatorios", href: ROUTES.ADMIN_REPORTS, icon: "FileBarChart" },
  { label: "Suporte", href: ROUTES.ADMIN_SUPPORT, icon: "Headphones" },
];
