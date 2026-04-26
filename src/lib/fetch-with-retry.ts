/**
 * Fetch wrapper that retries transient failures with exponential backoff.
 *
 * Use for outbound calls to external services we don't control (Steam Web
 * API, mempool.space, FX providers, etc.) where intermittent timeouts and
 * 5xx are expected.
 *
 * Treats as transient:
 *   - thrown errors (network failure, AbortError on timeout)
 *   - HTTP 408, 429, 502, 503, 504
 * Treats as permanent (no retry):
 *   - HTTP 4xx other than the transient ones above
 *   - HTTP 5xx other than the transient ones above (rare)
 */

interface RetryOptions {
  /** Max attempts including the first (default 3). */
  attempts?: number;
  /** Base delay in ms before first retry (default 250ms). */
  baseDelayMs?: number;
  /** Per-request timeout in ms (default 7000). */
  timeoutMs?: number;
  /** Optional label for logs. */
  label?: string;
}

const TRANSIENT_STATUS = new Set([408, 429, 502, 503, 504]);

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  opts: RetryOptions = {}
): Promise<Response> {
  const attempts = opts.attempts ?? 3;
  const baseDelay = opts.baseDelayMs ?? 250;
  const timeout = opts.timeoutMs ?? 7000;

  let lastErr: unknown = null;

  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);

      if (res.ok || !TRANSIENT_STATUS.has(res.status)) {
        return res;
      }
      // Transient HTTP error → retry
      lastErr = new Error(`HTTP ${res.status} on ${url}`);
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
    }

    // Don't sleep after the last attempt
    if (i < attempts - 1) {
      const jitter = Math.floor(Math.random() * 100);
      await sleep(baseDelay * Math.pow(2, i) + jitter);
    }
  }

  throw new Error(
    `${opts.label ?? "fetchWithRetry"} failed after ${attempts} attempts: ${
      lastErr instanceof Error ? lastErr.message : String(lastErr)
    }`
  );
}
