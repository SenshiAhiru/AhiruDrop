import { NextRequest, NextResponse } from "next/server";

/**
 * Simple in-memory rate limiter.
 *
 * Works per Vercel serverless function instance (not distributed).
 * For a small-to-medium MVP this is fine — each instance has its own counter,
 * and since functions are reused across requests, it still catches most abuse.
 *
 * If you need distributed rate limiting (across all instances), swap the
 * Map for Redis/Upstash — the API surface stays the same.
 */

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

// Periodic cleanup to avoid memory leaks from abandoned keys
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 60_000;

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitOptions = {
  /** Unique name for the limiter (e.g. "register", "login"). */
  key: string;
  /** Max requests allowed in the window. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
};

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetInSec: number;
};

/**
 * Extract client IP from Next.js request headers.
 * Vercel forwards via x-forwarded-for.
 */
export function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

/**
 * Check and increment a rate limit bucket.
 * Returns { ok: false } if the limit is exceeded.
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  cleanup();
  const now = Date.now();
  const key = `${options.key}:${identifier}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { ok: true, remaining: options.limit - 1, resetInSec: Math.ceil(options.windowMs / 1000) };
  }

  if (bucket.count >= options.limit) {
    return {
      ok: false,
      remaining: 0,
      resetInSec: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return {
    ok: true,
    remaining: options.limit - bucket.count,
    resetInSec: Math.ceil((bucket.resetAt - now) / 1000),
  };
}

/**
 * Convenience: apply a rate limit and return a 429 response if exceeded.
 * Usage in an API route:
 *
 *   const blocked = applyRateLimit(req, { key: "register", limit: 5, windowMs: 60_000 });
 *   if (blocked) return blocked;
 */
export function applyRateLimit(
  req: NextRequest,
  options: RateLimitOptions
): NextResponse | null {
  const ip = getClientIp(req);
  const result = rateLimit(ip, options);

  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        error: `Muitas tentativas. Tente novamente em ${result.resetInSec}s.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.resetInSec),
          "X-RateLimit-Limit": String(options.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.resetInSec),
        },
      }
    );
  }

  return null;
}

/**
 * Rate-limit purely by user-supplied identifier (e.g. session user.id).
 * Use this when the limit is per-user — IP rotation should NOT bypass it.
 *
 * If you want to limit anonymous traffic by IP, use applyRateLimit.
 * If you want to limit per (IP, sub-id) — e.g. "5 login attempts per IP per
 * email" — use applyRateLimitByIpAndId.
 */
export function applyRateLimitWithId(
  _req: NextRequest,
  identifier: string,
  options: RateLimitOptions
): NextResponse | null {
  const result = rateLimit(identifier, options);

  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        error: `Muitas tentativas. Tente novamente em ${result.resetInSec}s.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.resetInSec),
        },
      }
    );
  }

  return null;
}

/**
 * Compound limit: (IP, extraId) bucket. Useful for "5 login tries per email
 * per IP" — a single IP brute-forcing one email is throttled, but the same
 * IP on a different email gets a fresh budget.
 */
export function applyRateLimitByIpAndId(
  req: NextRequest,
  extraId: string,
  options: RateLimitOptions
): NextResponse | null {
  const ip = getClientIp(req);
  const result = rateLimit(`${ip}:${extraId}`, options);

  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        error: `Muitas tentativas. Tente novamente em ${result.resetInSec}s.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.resetInSec),
        },
      }
    );
  }

  return null;
}
