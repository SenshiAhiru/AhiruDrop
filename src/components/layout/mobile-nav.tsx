"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";

export interface MobileNavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  /**
   * If true, the item is treated as the index/dashboard route — only
   * highlighted on exact match. Use it for `/admin` (otherwise every
   * `/admin/*` route would also light up the Dashboard item).
   */
  exact?: boolean;
}

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  items: MobileNavItem[];
  /**
   * Section title shown next to the logo. Optional — when omitted, the
   * header still has the logo + close button.
   */
  title?: string;
  /**
   * Extra content rendered at the bottom of the drawer (typically a
   * user card with avatar/name).
   */
  children?: React.ReactNode;
}

export function MobileNav({ isOpen, onClose, items, title, children }: MobileNavProps) {
  const pathname = usePathname();

  // Lock body scroll while open + close on Escape (matches the
  // user-menu / popup conventions used elsewhere in the app).
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-[70] h-full w-72 max-w-[85vw] bg-[var(--card)] border-r border-[var(--border)] shadow-2xl",
          "flex flex-col transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Menu"}
      >
        {/* Header — logo + optional section badge + close */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--border)] shrink-0">
          <Logo size="md" />
          {title && (
            <span className="text-[10px] font-bold text-primary-500 uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary-600/10">
              {title}
            </span>
          )}
          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-lg text-surface-400 hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {items.map((item) => {
              // Match the desktop sidebar's logic: index routes only
              // highlight on exact match; nested routes light up their
              // parent (so `/admin/raffles/[id]` highlights "Rifas").
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary-600/10 text-primary-500"
                        : "text-surface-400 hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                    )}
                  >
                    {Icon && <Icon className="h-5 w-5 shrink-0" />}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Optional extra content */}
        {children && (
          <div className="border-t border-[var(--border)] p-4 shrink-0">{children}</div>
        )}
      </aside>
    </>
  );
}
