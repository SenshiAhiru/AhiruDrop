// Temporary Sentry smoke-test endpoint.
// GET /api/sentry-test throws on purpose so you can confirm the error shows up
// in the Sentry dashboard (Issues). DELETE this file once verified.
export const dynamic = "force-dynamic";

export function GET() {
  throw new Error("Sentry smoke test — AhiruDrop server error capture works ✅");
}
