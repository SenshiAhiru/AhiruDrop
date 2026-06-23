// Sentry — Node.js (server) runtime init.
// Imported by src/instrumentation.ts register() when NEXT_RUNTIME === "nodejs".
// Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance tracing — sample 10% of transactions. Enough to spot slow
  // routes/queries without burning the quota on a pre-launch site.
  tracesSampleRate: 0.1,

  // Only send events when a DSN is configured (i.e. skip local dev unless you
  // explicitly set the env var). Keeps noise out during `next dev`.
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set to true temporarily if events aren't showing up in the dashboard.
  debug: false,

  ignoreErrors: [
    // Next.js control-flow "errors" — these are how redirect()/notFound()
    // signal the framework, not real failures.
    "NEXT_REDIRECT",
    "NEXT_NOT_FOUND",
  ],
});
