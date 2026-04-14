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

/** Current Bitcoin blockchain tip height from mempool.space */
export async function getCurrentBtcHeight(): Promise<number> {
  const res = await fetch("https://mempool.space/api/blocks/tip/height", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch Bitcoin tip height");
  const text = (await res.text()).trim();
  const height = Number(text);
  if (!Number.isFinite(height) || height <= 0) {
    throw new Error(`Invalid height response: ${text}`);
  }
  return height;
}

/** Block hash at a specific height from mempool.space */
export async function getBtcBlockHashAtHeight(height: number): Promise<string> {
  const res = await fetch(`https://mempool.space/api/block-height/${height}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(
      `Block ${height} not yet mined or API unavailable (HTTP ${res.status})`
    );
  }
  const hash = (await res.text()).trim();
  if (!/^[0-9a-f]{64}$/i.test(hash)) {
    throw new Error(`Invalid block hash returned: ${hash}`);
  }
  return hash;
}

/** Default lead: ~6 blocks (~1h) in the future from the current tip */
export const DRAW_BLOCK_LEAD = 6;
