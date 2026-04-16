import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { notificationService } from "@/services/notification.service";
import { auditService } from "@/services/audit.service";

/**
 * Steam trade offer states (from Valve API):
 * 1 = Invalid, 2 = Active, 3 = Accepted, 4 = Countered,
 * 5 = Expired, 6 = Canceled, 7 = Declined, 8 = InvalidItems,
 * 9 = CreatedNeedsConfirmation, 10 = CanceledBySecondFactor,
 * 11 = InEscrow
 */
const STEAM_STATE_LABELS: Record<number, string> = {
  1: "Inválida",
  2: "Ativa (aguardando aceitação)",
  3: "Aceita ✅",
  4: "Contra-oferta",
  5: "Expirada",
  6: "Cancelada",
  7: "Recusada",
  8: "Itens inválidos",
  9: "Aguardando confirmação mobile",
  10: "Cancelada (2FA)",
  11: "Em custódia",
};

/**
 * Extract Steam partner ID from a trade URL.
 * Trade URL format: https://steamcommunity.com/tradeoffer/new/?partner=123456&token=xxx
 * Partner ID can be used to match trade offers from GetTradeOffers API.
 */
function extractPartnerId(tradeUrl: string): string | null {
  const match = tradeUrl.match(/partner=(\d+)/);
  return match ? match[1] : null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await req.json().catch(() => null);
    const { tradeId } = body ?? {};

    if (!tradeId) return errorResponse("tradeId obrigatório", 422);

    const trade = await prisma.tradeRequest.findUnique({
      where: { id: tradeId },
      include: {
        winner: {
          include: { draw: { include: { raffle: { select: { title: true } } } } },
        },
      },
    });

    if (!trade) return errorResponse("Trade não encontrado", 404);

    const apiKey = process.env.STEAM_API_KEY;
    if (!apiKey) return errorResponse("STEAM_API_KEY não configurada", 500);

    let offerId = trade.steamTradeOfferId;

    // If no offer ID saved, try to auto-detect from sent offers
    if (!offerId) {
      const partnerId = extractPartnerId(trade.steamTradeUrl);
      if (partnerId) {
        try {
          const listUrl = `https://api.steampowered.com/IEconService/GetTradeOffers/v1/?key=${apiKey}&get_sent_offers=1&active_only=0&time_historical_cutoff=${Math.floor(Date.now() / 1000) - 86400 * 7}`;
          const listRes = await fetch(listUrl, { cache: "no-store" });
          if (listRes.ok) {
            const listJson = await listRes.json();
            const offers = listJson?.response?.trade_offers_sent ?? [];
            // Find offer matching this partner (accountid_other)
            const match = offers.find(
              (o: any) => String(o.accountid_other) === partnerId
            );
            if (match) {
              offerId = String(match.tradeofferid);
              // Save it for future checks
              await prisma.tradeRequest.update({
                where: { id: tradeId },
                data: { steamTradeOfferId: offerId },
              });
            }
          }
        } catch (err) {
          console.error("[verify-steam] auto-detect failed:", err);
        }
      }

      if (!offerId) {
        return errorResponse(
          "Não consegui encontrar a trade offer automaticamente. Envie a trade no Steam primeiro.",
          400
        );
      }
    }

    // Query Steam Web API for this specific offer
    const steamUrl = `https://api.steampowered.com/IEconService/GetTradeOffer/v1/?key=${apiKey}&tradeofferid=${offerId}`;
    const steamRes = await fetch(steamUrl, { cache: "no-store" });

    if (!steamRes.ok) {
      return errorResponse(`Steam API retornou ${steamRes.status}`, 502);
    }

    const steamJson = await steamRes.json();
    const offer = steamJson?.response?.offer;

    if (!offer) {
      return errorResponse("Trade offer não encontrada na Steam. Verifique o ID.", 404);
    }

    const state = offer.trade_offer_state as number;
    const stateLabel = STEAM_STATE_LABELS[state] ?? `Desconhecido (${state})`;

    let autoCompleted = false;

    // If accepted (state 3) and not yet completed in our system → auto-complete
    if (state === 3 && trade.status !== "COMPLETED") {
      await prisma.$transaction(async (tx) => {
        await tx.tradeRequest.update({
          where: { id: tradeId },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
        await tx.winner.update({
          where: { id: trade.winnerId },
          data: { claimedAt: new Date() },
        });
      });

      // Notify user
      try {
        await notificationService.create(
          trade.userId,
          "SYSTEM",
          "Skin entregue com sucesso!",
          `A trade da skin "${trade.winner.draw.raffle?.title ?? "rifa"}" foi aceita e confirmada!`,
          { tradeId, link: "/dashboard/winnings" }
        );
      } catch {}

      await auditService.log(
        session.user.id,
        "TRADE_AUTO_COMPLETED",
        "trade_request",
        tradeId,
        { steamState: state, steamTradeOfferId: trade.steamTradeOfferId }
      );

      autoCompleted = true;
    }

    // If failed/expired/declined/cancelled → mark as failed
    if ([5, 6, 7, 8, 10].includes(state) && trade.status === "SENT") {
      await prisma.tradeRequest.update({
        where: { id: tradeId },
        data: { status: "FAILED", adminNotes: `Steam: ${stateLabel}` },
      });

      try {
        await notificationService.create(
          trade.userId,
          "SYSTEM",
          "Trade falhou",
          `A trade da skin "${trade.winner.draw.raffle?.title ?? "rifa"}" falhou: ${stateLabel}. Entre em contato com o suporte.`,
          { tradeId, link: "/dashboard/winnings" }
        );
      } catch {}
    }

    return successResponse({
      steamState: state,
      steamStateLabel: stateLabel,
      autoCompleted,
      currentStatus: autoCompleted ? "COMPLETED" : trade.status,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
