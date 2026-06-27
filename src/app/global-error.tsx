"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

// This boundary renders OUTSIDE the I18nProvider (the root layout failed), so
// it can't use useTranslation. We detect the locale inline from the same cookie
// the provider writes (falling back to the browser language) and pick from a
// tiny 2-language string map — keeping it bilingual without the catalog.
const STRINGS = {
  pt: {
    lang: "pt-BR",
    title: "Algo deu errado",
    message: "Ocorreu um erro inesperado. Tente novamente em alguns instantes.",
    retry: "Tentar novamente",
  },
  en: {
    lang: "en-US",
    title: "Something went wrong",
    message: "An unexpected error occurred. Please try again in a moment.",
    retry: "Try again",
  },
} as const;

function detectLocale(): "pt" | "en" {
  if (typeof document !== "undefined") {
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("ahiru-locale="));
    const val = cookie?.split("=")[1];
    if (val === "pt" || val === "en") return val;
  }
  if (typeof navigator !== "undefined") {
    if (navigator.language?.toLowerCase().startsWith("en")) return "en";
  }
  return "pt";
}

/**
 * Global error boundary — catches errors thrown in the root layout itself,
 * which the per-segment error.tsx boundaries can't reach. Must render its own
 * <html>/<body> because the root layout failed to render.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [t, setT] = useState<(typeof STRINGS)["pt" | "en"]>(STRINGS.pt);

  useEffect(() => {
    Sentry.captureException(error);
    // Resolve locale after mount (document/navigator available) — avoids any
    // SSR/hydration mismatch by starting from the pt default.
    setT(STRINGS[detectLocale()]);
  }, [error]);

  return (
    <html lang={t.lang}>
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          padding: "2rem",
          textAlign: "center",
          background: "#0a0a0b",
          color: "#fafafa",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
          {t.title}
        </h1>
        <p style={{ color: "#a1a1aa", maxWidth: "28rem", margin: 0 }}>
          {t.message}
        </p>
        <button
          onClick={reset}
          style={{
            height: "2.75rem",
            padding: "0 1.5rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "#7c3aed",
            color: "#fff",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {t.retry}
        </button>
      </body>
    </html>
  );
}
