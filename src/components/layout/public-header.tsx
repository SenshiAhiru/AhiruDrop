"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, Sun, Moon, User, LogOut, ChevronDown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { MobileNav, type MobileNavItem } from "@/components/layout/mobile-nav";
import { useTheme } from "@/components/providers/theme-provider";

const navLinks: MobileNavItem[] = [
  { label: "Home", href: "/" },
  { label: "Rifas", href: "/raffles" },
  { label: "Como Funciona", href: "/about" },
  { label: "FAQ", href: "/faq" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click - only checks the dropdown ref
  useEffect(() => {
    if (!userMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    // Use setTimeout to avoid catching the same click that opened the menu
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  // Close dropdown on navigation
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300",
          scrolled
            ? "backdrop-blur-lg border-b border-[var(--border)] shadow-sm bg-surface-950/90"
            : "bg-surface-950/50 backdrop-blur-sm"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <Logo size="md" />
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "text-primary-500 bg-primary-600/10"
                        : "text-surface-400 hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-surface-400 hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                aria-label="Alternar tema"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {session?.user ? (
                <div className="relative hidden md:block" ref={dropdownRef}>
                  <button
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 p-2 rounded-lg text-sm font-medium text-surface-400 hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  >
                    <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary-600 text-white text-xs font-bold">
                      {session.user.name?.charAt(0).toUpperCase() ?? "U"}
                    </span>
                    <span className="max-w-[120px] truncate">{session.user.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xl py-1 z-50">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-surface-400 hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Minha Conta
                      </Link>
                      {((session.user as any).role === "ADMIN" || (session.user as any).role === "SUPER_ADMIN") && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-accent-500 hover:bg-[var(--muted)] transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield className="h-4 w-4" />
                          Painel Admin
                        </Link>
                      )}
                      <hr className="border-[var(--border)] my-1" />
                      <a
                        href="/api/auth/signout"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-[var(--muted)] transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center h-8 px-3 text-xs font-semibold rounded-md hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center h-8 px-3 text-xs font-semibold rounded-md bg-primary-600 text-white hover:bg-primary-700 shadow-sm transition-colors"
                  >
                    Cadastrar
                  </Link>
                </div>
              )}

              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 rounded-lg text-surface-400 hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileNav
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        items={navLinks}
        title="Menu"
      >
        {session?.user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center justify-center h-9 w-9 rounded-full bg-primary-600 text-white text-sm font-bold">
                {session.user.name?.charAt(0).toUpperCase() ?? "U"}
              </span>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{session.user.name}</p>
                <p className="text-xs text-surface-500">{session.user.email}</p>
              </div>
            </div>
            <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-surface-400 hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
              <User className="h-4 w-4" /> Minha Conta
            </Link>
            {((session.user as any).role === "ADMIN" || (session.user as any).role === "SUPER_ADMIN") && (
              <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-accent-500 hover:bg-[var(--muted)] transition-colors">
                <Shield className="h-4 w-4" /> Painel Admin
              </Link>
            )}
            <a href="/api/auth/signout" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-danger hover:bg-[var(--muted)] transition-colors">
              <LogOut className="h-4 w-4" /> Sair
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link href="/login" className="inline-flex items-center justify-center h-8 px-3 text-xs font-semibold rounded-md border border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors">
              Entrar
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center h-8 px-3 text-xs font-semibold rounded-md bg-primary-600 text-white hover:bg-primary-700 shadow-sm transition-colors">
              Cadastrar
            </Link>
          </div>
        )}
      </MobileNav>
    </>
  );
}
