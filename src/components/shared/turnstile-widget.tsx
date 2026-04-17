"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

interface Props {
  onToken: (token: string | null) => void;
  theme?: "light" | "dark" | "auto";
}

/**
 * Cloudflare Turnstile widget.
 * Loads the script once and renders the challenge.
 * Calls onToken with the verified token (or null if expired/failed).
 *
 * If NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set, renders nothing
 * (app still works with TURNSTILE_SECRET_KEY also unset on server).
 */
export function TurnstileWidget({ onToken, theme = "dark" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // Load the Turnstile script once
  useEffect(() => {
    if (!siteKey) return;
    if (typeof window === "undefined") return;

    if (window.turnstile) {
      setReady(true);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="challenges.cloudflare.com/turnstile"]'
    );
    if (existing) {
      existing.addEventListener("load", () => setReady(true));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, [siteKey]);

  // Render widget
  useEffect(() => {
    if (!ready || !siteKey || !containerRef.current || !window.turnstile) return;

    // Clean up previous widget
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {}
    }

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        callback: (token) => onToken(token),
        "error-callback": () => onToken(null),
        "expired-callback": () => onToken(null),
      });
    } catch (err) {
      console.error("Turnstile render failed:", err);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [ready, siteKey, theme, onToken]);

  // If no site key configured, render nothing (dev mode)
  if (!siteKey) return null;

  return <div ref={containerRef} className="flex justify-center" />;
}
