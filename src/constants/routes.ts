export const ROUTES = {
  // Public
  HOME: "/",
  RAFFLES: "/rifas",
  RAFFLE_DETAIL: "/rifas/[slug]",
  HOW_IT_WORKS: "/como-funciona",
  FAQ: "/faq",
  TERMS: "/termos",
  PRIVACY: "/privacidade",

  // Auth
  LOGIN: "/login",
  REGISTER: "/cadastro",
  FORGOT_PASSWORD: "/esqueci-senha",
  RESET_PASSWORD: "/redefinir-senha",
  VERIFY_EMAIL: "/verificar-email",

  // Dashboard (authenticated user)
  DASHBOARD: "/dashboard",
  DASHBOARD_ORDERS: "/dashboard/pedidos",
  DASHBOARD_ORDER_DETAIL: "/dashboard/pedidos/[id]",
  DASHBOARD_PROFILE: "/dashboard/perfil",
  DASHBOARD_NOTIFICATIONS: "/dashboard/notificacoes",

  // Admin
  ADMIN: "/admin",
  ADMIN_RAFFLES: "/admin/rifas",
  ADMIN_RAFFLE_CREATE: "/admin/rifas/criar",
  ADMIN_RAFFLE_EDIT: "/admin/rifas/[id]/editar",
  ADMIN_ORDERS: "/admin/pedidos",
  ADMIN_USERS: "/admin/usuarios",
  ADMIN_PAYMENTS: "/admin/pagamentos",
  ADMIN_GATEWAYS: "/admin/gateways",
  ADMIN_COUPONS: "/admin/cupons",
  ADMIN_SETTINGS: "/admin/configuracoes",
  ADMIN_REPORTS: "/admin/relatorios",
  ADMIN_SUPPORT: "/admin/suporte",

  // API
  API_AUTH: "/api/auth",
  API_RAFFLES: "/api/raffles",
  API_ORDERS: "/api/orders",
  API_PAYMENTS: "/api/payments",
  API_WEBHOOKS: "/api/webhooks",
  API_ADMIN: "/api/admin",
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
