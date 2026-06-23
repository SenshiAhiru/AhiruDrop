// Sentry — Edge runtime init (middleware, edge routes).
// Imported by src/instrumentation.ts register() when NEXT_RUNTIME === "edge".
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  debug: false,
  ignoreErrors: ["NEXT_REDIRECT", "NEXT_NOT_FOUND"],
});
