/**
 * Discriminated union for the `data` blob attached to Notification rows.
 *
 * The DB column is Json without a schema (intentional — Notification is a
 * generic envelope across many features). This module documents the
 * shapes we actually emit, so the frontend (and us, while reading code)
 * can narrow safely.
 *
 * To add a new notification kind:
 *   1. Add an entry below
 *   2. Wherever you call notificationService.create, pass `data` matching
 *      one of these shapes (cast as NotificationData if needed)
 */

export type NotificationData =
  | { kind: "raffle"; raffleId: string; link?: string }
  | { kind: "order"; orderId: string; link?: string }
  | { kind: "payment"; orderId: string; amount?: number; link?: string }
  | { kind: "winner"; raffleId: string; numberWon: number; link?: string }
  | { kind: "trade"; tradeId: string; link?: string }
  | { kind: "support"; ticketId: string; link?: string }
  | { kind: "system"; link?: string; [k: string]: unknown }
  // Legacy / loosely-typed payloads still in flight. Allowed for backward
  // compat — new emit sites should pick one of the typed kinds above.
  | { link?: string; [k: string]: unknown };

/** Type guard helper: narrow data into a known kind, or null. */
export function asNotificationKind<K extends NotificationData["kind"] & string>(
  data: unknown,
  kind: K
): Extract<NotificationData, { kind: K }> | null {
  if (
    typeof data === "object" &&
    data !== null &&
    "kind" in data &&
    (data as { kind?: unknown }).kind === kind
  ) {
    return data as Extract<NotificationData, { kind: K }>;
  }
  return null;
}
