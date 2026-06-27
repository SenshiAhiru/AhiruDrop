import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Content-Security-Policy — anti-XSS defense-in-depth.
//
// Shipped as Report-Only first: it does NOT block anything, only reports what
// it *would* block. This lets us exercise the live payment flows (Stripe
// Checkout, Mercado Pago PIX) and confirm no legit resource is caught before
// flipping the header name to "Content-Security-Policy" (enforcing).
//
// Origins allowed: Stripe (js/api/checkout), Mercado Pago SDK + mlstatic,
// Supabase, Sentry ingest (the SDK tunnels via same-origin /monitoring, ingest
// kept as fallback), Vercel Analytics (same-origin), Steam image CDNs.
// 'unsafe-inline' on script/style is required by Next's hydration + Tailwind
// without a nonce pipeline — a future upgrade is nonce-based scripts.
const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.stripe.com https://*.mercadopago.com https://*.mercadopago.com.br",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com https://sdk.mercadopago.com https://*.mercadopago.com https://secure.mlstatic.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://*.steamstatic.com https://*.akamaihd.net https://community.akamai.steamstatic.com https://raw.githubusercontent.com https://*.mlstatic.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.stripe.com https://*.supabase.co https://*.ingest.us.sentry.io https://api.mercadopago.com https://*.mercadopago.com https://*.mlstatic.com",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://*.mercadopago.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join("; ");

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.steamstatic.com" },
      { protocol: "https", hostname: "community.akamai.steamstatic.com" },
      { protocol: "https", hostname: "**.akamaihd.net" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            // Report-Only — observe violations without blocking. Flip the key
            // to "Content-Security-Policy" to enforce once the payment flows
            // are confirmed clean in the browser console.
            key: "Content-Security-Policy-Report-Only",
            value: cspDirectives,
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry org/project — used for source-map upload at build time.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Upload source maps so stack traces in the dashboard point at real source
  // lines instead of minified bundles. Needs SENTRY_AUTH_TOKEN at build time
  // (set in Vercel). Silent in CI, verbose locally.
  silent: !process.env.CI,

  // Strip uploaded source maps from the client bundle so they aren't publicly
  // served — they still reach Sentry for symbolication.
  sourcemaps: { deleteSourcemapsAfterUpload: true },

  // Tunnel browser→Sentry requests through this same-origin route so ad/track
  // blockers don't drop client error reports.
  tunnelRoute: "/monitoring",
});
