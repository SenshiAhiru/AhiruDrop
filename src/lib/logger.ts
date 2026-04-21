/**
 * Minimal logger wrapper.
 *
 * - devLog / devWarn: only print in non-production envs. Use for verbose
 *   diagnostic output that shouldn't clutter production logs.
 * - log / warn / error: always print. Reserved for operational events
 *   (webhook outcomes, payment crediting, errors worth alerting on).
 */

const isProd = process.env.NODE_ENV === "production";

/* eslint-disable no-console */

export function devLog(...args: unknown[]): void {
  if (!isProd) console.log(...args);
}

export function devWarn(...args: unknown[]): void {
  if (!isProd) console.warn(...args);
}

export function log(...args: unknown[]): void {
  console.log(...args);
}

export function warn(...args: unknown[]): void {
  console.warn(...args);
}

export function error(...args: unknown[]): void {
  console.error(...args);
}
