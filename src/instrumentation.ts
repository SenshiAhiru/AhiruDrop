// Next.js instrumentation hook — runs once per server runtime at startup.
// Loads the Sentry server/edge init for the active runtime, and re-exports
// onRequestError so Sentry captures errors thrown in Server Components,
// route handlers, and the rest of the React server render path.
// Next 16 docs: node_modules/next/dist/docs/01-app/02-guides/instrumentation.md
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
