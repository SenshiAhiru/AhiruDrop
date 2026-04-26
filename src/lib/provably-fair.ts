import crypto from "crypto";

/**
 * Provably Fair — Commit & Reveal scheme with Bitcoin block hash as public beacon.
 *
 * Flow:
 *  1. At raffle creation:
 *     - Generate random serverSeed (32 bytes)
 *     - Publish serverSeedHash = SHA256(serverSeed) — committed, tamper-evident
 *     - Store serverSeedEncrypted (AES-256-GCM) — kept secret until draw
 *     - Lock drawBlockHeight = currentBtcHeight + 6 (~1h in future)
 *
 *  2. At draw time:
 *     - Fetch Bitcoin block hash at drawBlockHeight from mempool.space
 *     - combined = HMAC_SHA256(serverSeed, blockHash + ":" + raffleId)
 *     - winningIndex = parseInt(combined[:16], 16) % totalPaidTickets
 *     - Reveal serverSeed and blockHash in the draw record
 *
 *  3. Anyone can verify:
 *     - SHA256(serverSeedRevealed) == serverSeedHash  (commitment integrity)
 *     - Block at drawBlockHeight has the recorded blockHash  (public beacon)
 *     - Re-compute the HMAC and the winning index  (deterministic)
 */

export function generateServerSeed(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashSeed(serverSeed: string): string {
  return crypto.createHash("sha256").update(serverSeed).digest("hex");
}

/**
 * Deterministically picks a winning index given the revealed beacon data.
 * @param serverSeed Hex string (64 chars), kept secret until draw
 * @param blockHash Bitcoin block hash (hex string)
 * @param raffleId Raffle ID, anchors the calculation to this specific raffle
 * @param totalTickets Number of paid/eligible tickets
 * @returns 0-based index of the winning ticket
 */
export function computeWinningIndex(
  serverSeed: string,
  blockHash: string,
  raffleId: string,
  totalTickets: number
): number {
  if (totalTickets <= 0) throw new Error("totalTickets must be > 0");

  const message = `${blockHash}:${raffleId}`;
  const hmac = crypto
    .createHmac("sha256", serverSeed)
    .update(message)
    .digest("hex");

  // Take first 16 hex chars → 64-bit unsigned int
  // BigInt avoids float precision loss on large ticket counts
  const slice = hmac.slice(0, 16);
  const bigNum = BigInt("0x" + slice);
  return Number(bigNum % BigInt(totalTickets));
}

// Multiple independent Bitcoin block explorers. We try them in order
// and only fail if all of them fail — one provider going down (or rate-
// limiting us) shouldn't break the draw service.
type BtcProvider = {
  name: string;
  tipHeight: () => Promise<number>;
  blockHashAtHeight: (h: number) => Promise<string>;
};

const BTC_PROVIDERS: BtcProvider[] = [
  {
    name: "mempool.space",
    tipHeight: async () => {
      const res = await fetch("https://mempool.space/api/blocks/tip/height", {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`mempool.space tip ${res.status}`);
      return Number((await res.text()).trim());
    },
    blockHashAtHeight: async (h) => {
      const res = await fetch(`https://mempool.space/api/block-height/${h}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`mempool.space block ${h}: ${res.status}`);
      return (await res.text()).trim();
    },
  },
  {
    name: "blockstream.info",
    tipHeight: async () => {
      const res = await fetch("https://blockstream.info/api/blocks/tip/height", {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`blockstream tip ${res.status}`);
      return Number((await res.text()).trim());
    },
    blockHashAtHeight: async (h) => {
      const res = await fetch(`https://blockstream.info/api/block-height/${h}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`blockstream block ${h}: ${res.status}`);
      return (await res.text()).trim();
    },
  },
];

async function tryProviders<T>(
  op: (p: BtcProvider) => Promise<T>,
  validate: (v: T) => boolean,
  errorLabel: string
): Promise<T> {
  const errors: string[] = [];
  for (const p of BTC_PROVIDERS) {
    try {
      const v = await op(p);
      if (validate(v)) return v;
      errors.push(`${p.name}: invalid response`);
    } catch (err) {
      errors.push(
        `${p.name}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
  throw new Error(`${errorLabel} — all providers failed: ${errors.join("; ")}`);
}

/** Current Bitcoin blockchain tip height (with provider fallback). */
export async function getCurrentBtcHeight(): Promise<number> {
  return tryProviders(
    (p) => p.tipHeight(),
    (h) => Number.isFinite(h) && h > 0,
    "Failed to fetch Bitcoin tip height"
  );
}

/** Block hash at a specific height (with provider fallback). */
export async function getBtcBlockHashAtHeight(height: number): Promise<string> {
  return tryProviders(
    (p) => p.blockHashAtHeight(height),
    (hash) => /^[0-9a-f]{64}$/i.test(hash),
    `Failed to fetch block ${height}`
  );
}

/** Default lead: ~2 blocks (~20min) in the future from the current tip */
export const DRAW_BLOCK_LEAD = 2;
