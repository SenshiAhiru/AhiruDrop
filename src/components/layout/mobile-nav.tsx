"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MobileNavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  items: MobileNavItem[];
  title?: string;
  children?: React.ReactNode;
}

export function MobileNav({ isOpen, onClose, items, title, children }: MobileNavProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
          "fixed top-0 left-0 z-[70] h-full w-72 bg-[var(--card)] border-r border-[var(--border)] shadow-2xl",
          "flex flex-col transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--border)]">
          {title && (
            <span className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">
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
              const isActive = pathname === item.href;
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
          <div className="border-t border-[var(--border)] p-4">{children}</div>
        )}
      </aside>
    </>
  );
}
