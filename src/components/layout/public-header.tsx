"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Menu, Sun, Moon, X,
  LayoutDashboard, ShoppingCart, User, Bell, Trophy, Shield, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { UserMenu } from "@/components/shared/user-menu";
import { AhcBalance } from "@/components/shared/ahc-balance";
import { useTheme } from "@/components/providers/theme-provider";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Rifas", href: "/raffles" },
  { label: "Ganhadores", href: "/winners" },
  { label: "Como Funciona", href: "/about" },
  { label: "FAQ", href: "/faq" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin =
    (session?.user as any)?.role === "ADMIN" ||
    (session?.user as any)?.role === "SUPER_ADMIN";

  const accountLinks = [
    { label: "Minha Conta", href: "/dashboard", icon: LayoutDashboard },
    { label: "Meus Pedidos", href: "/dashboard/orders", icon: ShoppingCart },
    { label: "Minhas Vitórias", href: "/dashboard/winnings", icon: Trophy },
    { label: "Perfil", href: "/dashboard/profile", icon: User },
    { label: "Notificações", href: "/dashboard/notifications", icon: Bell },
  ];

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-surface-950/80 backdrop-blur-lg border-b border-surface-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <span onClick={() => setMenuOpen(false)}>
              <Logo size="md" />
            </span>

            <nav className="hidden md:flex items-center justify-center gap-1 flex-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "text-primary-500 bg-primary-600/10"
                      : "text-surface-400 hover:text-white hover:bg-surface-800"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleTheme()}
                className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {session?.user ? (
                <div className="hidden md:flex items-center gap-2">
                  <AhcBalance />
                  <UserMenu />
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login" className="px-3 py-1.5 text-sm font-medium text-surface-400 hover:text-white transition-colors">
                    Entrar
                  </Link>
                  <Link href="/register" className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors">
                    Cadastrar
                  </Link>
                </div>
              )}

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 left-0 w-[85vw] max-w-sm h-full bg-surface-950 border-r border-surface-800 flex flex-col overflow-y-auto">
            {/* Header com Logo + Fechar */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-surface-800 shrink-0">
              <Logo size="md" />
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User header card (se logado) */}
            {session?.user && (
              <div className="px-4 py-4 border-b border-surface-800 flex items-center gap-3">
                {session.user.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={session.user.image}
                    alt=""
                    className="h-12 w-12 rounded-full border-2 border-primary-500/50 object-cover"
                  />
                ) : (
                  <span className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-600 text-white text-lg font-bold">
                    {session.user.name?.charAt(0).toUpperCase() ?? "U"}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-surface-400 truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            )}

            {/* Saldo (se logado) */}
            {session?.user && (
              <div className="px-4 py-3 border-b border-surface-800">
                <AhcBalance className="w-full" />
              </div>
            )}

            {/* Nav pública */}
            <nav className="px-3 py-3 space-y-1">
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-surface-500">
                Navegação
              </p>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "text-primary-400 bg-primary-600/10"
                      : "text-surface-300 hover:text-white hover:bg-surface-800"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Conta do usuário (se logado) */}
            {session?.user ? (
              <>
                <hr className="border-surface-800" />
                <nav className="px-3 py-3 space-y-1">
                  <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-surface-500">
                    Minha Conta
                  </p>
                  {accountLinks.map((link) => {
                    const Icon = link.icon;
                    const active = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          active
                            ? "text-primary-400 bg-primary-600/10"
                            : "text-surface-300 hover:text-white hover:bg-surface-800"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {link.label}
                      </Link>
                    );
                  })}

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-accent-400 hover:bg-accent-500/10 transition-colors"
                    >
                      <Shield className="h-4 w-4 shrink-0" />
                      Painel Admin
                    </Link>
                  )}

                  <Link
                    href="/signout"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors mt-2"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Sair
                  </Link>
                </nav>
              </>
            ) : (
              <>
                <hr className="border-surface-800" />
                <div className="px-4 py-4 space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold border border-surface-700 text-surface-300 hover:text-white hover:bg-surface-800"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700"
                  >
                    Cadastrar
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
