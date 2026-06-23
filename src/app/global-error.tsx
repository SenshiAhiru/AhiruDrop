"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

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
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
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
          Algo deu errado
        </h1>
        <p style={{ color: "#a1a1aa", maxWidth: "28rem", margin: 0 }}>
          Ocorreu um erro inesperado. Tente novamente em alguns instantes.
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
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
