// Sentry — browser (client) runtime init.
// Next 16 / Sentry v9+ convention: client init lives here (replaces the old
// sentry.client.config.ts). Next runs this automatically on the client.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance tracing — 10%. No session replay (privacy + quota).
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  debug: false,

  ignoreErrors: [
    // Browser extension / noise that isn't actionable.
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications.",
    // Next.js control-flow signals.
    "NEXT_REDIRECT",
    "NEXT_NOT_FOUND",
  ],
});

// Lets Sentry instrument client-side navigations (App Router transitions).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
