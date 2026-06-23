import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

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
