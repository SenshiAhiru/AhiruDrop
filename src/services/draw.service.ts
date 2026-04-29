import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { raffleRepository } from "@/repositories/raffle.repository";
import { raffleNumberRepository } from "@/repositories/raffle-number.repository";
import { notificationService } from "./notification.service";
import { decrypt } from "@/lib/crypto";
import {
  computeWinningIndex,
  getBtcBlockHashAtHeight,
  getCurrentBtcHeight,
  hashSeed,
} from "@/lib/provably-fair";
import { devLog } from "@/lib/logger";

export const drawService = {
  async executeDraw(raffleId: string, adminId: string) {
    const raffle = await raffleRepository.findById(raffleId);
    if (!raffle) throw new Error("Rifa não encontrada");
    if (raffle.status !== "CLOSED") {
      throw new Error("A rifa precisa estar fechada para realizar o sorteio");
    }

    // Concurrency lock: claim the raffle by transitioning CLOSED → DRAWN
    // pre-emptively. updateMany with the CLOSED filter wins exactly once;
    // a second admin clicking "Sortear" simultaneously sees affected=0 and
    // bails before duplicate winners can be created. We rollback the status
    // to CLOSED if the actual draw work below throws.
    const claim = await prisma.raffle.updateMany({
      where: { id: raffleId, status: "CLOSED" },
      data: { status: "DRAWN" },
    });
    if (claim.count === 0) {
      throw new Error(
        "Sorteio já em andamento ou concluído por outro administrador."
      );
    }

    let drawSucceeded = false;
    try {

    // Only PAID numbers are eligible
    const all = await raffleNumberRepository.findByRaffle(raffleId);
    const eligible = all.filter((n) => n.status === "PAID");
    if (eligible.length === 0) {
      throw new Error("Nenhum número foi vendido para esta rifa");
    }

    // Provably fair path — requires commit made at creation
    const hasCommit = Boolean(
      raffle.serverSeedHash && raffle.serverSeedEncrypted
    );

    let winningIndex: number;
    let serverSeedRevealed: string | null = null;
    let blockHash: string | null = null;
    let blockHeight: number | null = null;
    let drawMethod = "crypto";

    if (hasCommit) {
      devLog("[drawService] Provably fair path; raffleId=", raffleId);
      // Reveal the committed seed
      try {
        serverSeedRevealed = decrypt(raffle.serverSeedEncrypted!);
      } catch (err) {
        console.error("[drawService] decrypt failed:", err);
        throw new Error(
          "Falha ao decifrar o seed. Verifique a variável GATEWAY_ENCRYPTION_KEY."
        );
      }

      // Sanity check — hash must match what was committed
      if (hashSeed(serverSeedRevealed) !== raffle.serverSeedHash) {
        throw new Error(
          "Falha de integridade: o seed decifrado não corresponde ao hash commitado"
        );
      }

      // Determine beacon block height
      blockHeight = raffle.drawBlockHeight ?? null;
      devLog("[drawService] drawBlockHeight from raffle:", blockHeight);

      // SECURITY: refuse to draw a provably-fair raffle without a committed
      // block height. The previous behavior backfilled with the current tip,
      // which let an admin time the draw to a favorable block — defeating
      // the unpredictability guarantee. The block height MUST be committed
      // BEFORE the draw so the beacon is unforgeable.
      if (!blockHeight) {
        throw new Error(
          "Rifa provably-fair não tem drawBlockHeight commitado. Defina manualmente um bloco futuro antes de sortear (compromisso prévio é parte do esquema de provably fair)."
        );
      }

      // Ensure block is mined — if target height > current tip, refuse
      const tip = await getCurrentBtcHeight();
      devLog("[drawService] current BTC tip:", tip);
      if (blockHeight > tip) {
        const blocksAway = blockHeight - tip;
        const minutesAway = blocksAway * 10;
        throw new Error(
          `Bloco alvo ainda não foi minerado. Faltam ${blocksAway} bloco(s) (~${minutesAway}min). Tip atual: ${tip}, alvo: ${blockHeight}.`
        );
      }

      blockHash = await getBtcBlockHashAtHeight(blockHeight);
      devLog("[drawService] blockHash:", blockHash);

      winningIndex = computeWinningIndex(
        serverSeedRevealed,
        blockHash,
        raffleId,
        eligible.length
      );
      drawMethod = "provably-fair-btc";
    } else {
      // Legacy path — raffles created before provably-fair was introduced
      winningIndex = crypto.randomInt(0, eligible.length);
    }

    const winningNumberRecord = eligible[winningIndex];

    // Build audit hash (same shape as before for backwards compat in UIs)
    const timestamp = new Date().toISOString();
    const seedForAudit = serverSeedRevealed || crypto.randomBytes(32).toString("hex");
    const hashInput = `${seedForAudit}:${winningNumberRecord.number}:${timestamp}:${raffleId}`;
    const resultHash = crypto.createHash("sha256").update(hashInput).digest("hex");

    const draw = await prisma.raffleDraw.create({
      data: {
        raffleId,
        adminId,
        winningNumber: winningNumberRecord.number,
        resultHash,
        seed: seedForAudit,
        drawMethod,
        ...(serverSeedRevealed && { serverSeedRevealed }),
        ...(blockHash && { blockHash }),
        ...(blockHeight && { blockHeight }),
      },
    });

    // Find winner (user who owns this number)
    if (winningNumberRecord.id) {
      const numberWithOrder = await prisma.raffleNumber.findUnique({
        where: { id: winningNumberRecord.id },
        select: { orderId: true },
      });

      if (numberWithOrder?.orderId) {
        const order = await prisma.order.findUnique({
          where: { id: numberWithOrder.orderId },
        });

        if (order) {
          await prisma.winner.create({
            data: {
              drawId: draw.id,
              raffleId,
              userId: order.userId,
              numberWon: winningNumberRecord.number,
            },
          });

          await notificationService.notifyWinner(
            order.userId,
            raffle.title,
            winningNumberRecord.number
          );

          // Announce on Discord. Best-effort — never blocks the draw.
          try {
            const winnerUser = await prisma.user.findUnique({
              where: { id: order.userId },
              select: { name: true, avatarUrl: true },
            });
            const { discord } = await import("@/lib/discord");
            await discord.notifyWinner({
              raffleId: raffle.id,
              raffleSlug: raffle.slug,
              raffleTitle: raffle.title,
              skinImage: raffle.skinImage ?? null,
              skinRarityColor: raffle.skinRarityColor ?? null,
              winnerName: winnerUser?.name ?? "Anônimo",
              winnerAvatarUrl: winnerUser?.avatarUrl ?? null,
              winningNumber: winningNumberRecord.number,
              blockHeight: blockHeight ?? null,
            });
          } catch (err) {
            console.error("[draw] discord winner webhook failed:", err);
          }
        }
      }
    }

      // Status was already pre-claimed to DRAWN above. Mark success so
      // the catch block below doesn't rollback.
      drawSucceeded = true;

      return {
        draw,
        winningNumber: winningNumberRecord.number,
        resultHash,
        seed: seedForAudit,
        timestamp,
        provablyFair: hasCommit
          ? {
              serverSeedHash: raffle.serverSeedHash,
              serverSeedRevealed,
              blockHash,
              blockHeight,
              winningIndex,
              totalEligible: eligible.length,
            }
          : null,
      };
    } finally {
      // If the draw work failed mid-way, release the CLOSED → DRAWN claim
      // so a retry is possible. (Without this, a transient error would
      // strand the raffle in DRAWN with no actual draw record.)
      if (!drawSucceeded) {
        await prisma.raffle.updateMany({
          where: { id: raffleId, status: "DRAWN" },
          data: { status: "CLOSED" },
        });
      }
    }
  },

  async getResult(raffleId: string) {
    const draw = await prisma.raffleDraw.findFirst({
      where: { raffleId },
      include: { winner: true },
      orderBy: { drawnAt: "desc" },
    });

    if (!draw) return null;

    const raffle = await raffleRepository.findById(raffleId);
    return { draw, raffle };
  },
};
