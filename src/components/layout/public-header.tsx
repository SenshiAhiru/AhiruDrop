"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, Sun, Moon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { UserMenu } from "@/components/shared/user-menu";
import { AhcBalance } from "@/components/shared/ahc-balance";
import { useTheme } from "@/components/providers/theme-provider";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Rifas", href: "/raffles" },
  { label: "Como Funciona", href: "/about" },
  { label: "FAQ", href: "/faq" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-surface-950/80 backdrop-blur-lg border-b border-surface-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span onClick={() => setMenuOpen(false)}>
              <Logo size="md" />
            </span>

            <nav className="hidden md:flex items-center gap-1">
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
          <div className="absolute top-0 left-0 w-72 h-full bg-surface-950 border-r border-surface-800 p-4 pt-20 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-primary-500 bg-primary-600/10"
                    : "text-surface-400 hover:text-white hover:bg-surface-800"
                )}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-surface-800 my-3" />
            {session?.user ? (
              <div onClick={() => setMenuOpen(false)}>
                <UserMenu />
              </div>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-surface-400 hover:text-white hover:bg-surface-800">
                  Entrar
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-semibold text-primary-500 hover:bg-surface-800">
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
