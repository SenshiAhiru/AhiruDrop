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
      console.log("[verify-steam] auto-detect: partnerId =", partnerId);

      if (partnerId) {
        try {
          // Fetch ALL sent offers (no time filter to be safe)
          const listUrl = `https://api.steampowered.com/IEconService/GetTradeOffers/v1/?key=${apiKey}&get_sent_offers=1&active_only=0&historical_cutoff=${Math.floor(Date.now() / 1000) - 86400 * 30}`;
          const listRes = await fetch(listUrl, { cache: "no-store" });
          console.log("[verify-steam] GetTradeOffers status:", listRes.status);

          if (listRes.ok) {
            const listJson = await listRes.json();
            const offers = listJson?.response?.trade_offers_sent ?? [];
            console.log("[verify-steam] found", offers.length, "sent offers");

            if (offers.length > 0) {
              console.log("[verify-steam] first offer sample:", JSON.stringify({
                tradeofferid: offers[0].tradeofferid,
                accountid_other: offers[0].accountid_other,
                trade_offer_state: offers[0].trade_offer_state,
              }));
            }

            // Find offer matching this partner (accountid_other)
            const match = offers.find(
              (o: any) => String(o.accountid_other) === partnerId
            );

            if (match) {
              offerId = String(match.tradeofferid);
              console.log("[verify-steam] matched offer:", offerId, "state:", match.trade_offer_state);
              // Save it for future checks
              await prisma.tradeRequest.update({
                where: { id: tradeId },
                data: { steamTradeOfferId: offerId },
              });
            } else {
              console.log("[verify-steam] no match found for partnerId", partnerId);
              // Return debug info so admin can see what's happening
              return errorResponse(
                `Não encontrei trade pra partner ${partnerId}. ${offers.length} offer(s) enviadas encontradas. Tente informar o Trade Offer ID manualmente.`,
                400
              );
            }
          }
        } catch (err) {
          console.error("[verify-steam] auto-detect failed:", err);
        }
      }

      if (!offerId) {
        return errorResponse(
          "Não consegui encontrar a trade offer automaticamente. Tente informar o Trade Offer ID manualmente.",
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
      // Steam sometimes returns empty response for offers that exist, due to
      // indexing delay (can take hours) or the new cursor-based API quirks.
      // Don't surface as "not found" — suggest manual action instead.
      return errorResponse(
        "Steam API não retornou dados para esta offer. Pode ser delay de indexação (até algumas horas após aceite). Se você confirmou o aceite manualmente, use o botão ✅ Entregue.",
        503
      );
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
