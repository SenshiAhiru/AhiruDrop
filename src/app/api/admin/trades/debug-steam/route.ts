import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

/**
 * Debug endpoint: fetches raw Steam GetTradeOffers response for admin inspection.
 * Shows what Steam is actually returning so we can see why auto-detect fails.
 *
 * Usage: POST /api/admin/trades/debug-steam { tradeId? }
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const apiKey = process.env.STEAM_API_KEY;
    if (!apiKey) return errorResponse("STEAM_API_KEY não configurada", 500);

    const body = await req.json().catch(() => ({}));
    const tradeId = body?.tradeId as string | undefined;

    // Optional: fetch a specific trade's URL for context
    let tradeContext: any = null;
    if (tradeId) {
      const trade = await prisma.tradeRequest.findUnique({
        where: { id: tradeId },
        select: {
          id: true,
          steamTradeUrl: true,
          steamTradeOfferId: true,
          status: true,
          user: { select: { name: true, steamId: true } },
        },
      });
      if (trade) {
        const partnerMatch = trade.steamTradeUrl.match(/partner=(\d+)/);
        tradeContext = {
          ...trade,
          extractedPartnerId: partnerMatch?.[1] ?? null,
        };
      }
    }

    // Fetch ALL sent offers from last 30 days
    const cutoff = Math.floor(Date.now() / 1000) - 86400 * 30;
    const url = `https://api.steampowered.com/IEconService/GetTradeOffers/v1/?key=${apiKey}&get_sent_offers=1&active_only=0&historical_cutoff=${cutoff}&get_descriptions=0`;

    const start = Date.now();
    const res = await fetch(url, { cache: "no-store" });
    const elapsed = Date.now() - start;

    const statusCode = res.status;
    const rawText = await res.text();
    let parsed: any = null;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // not JSON
    }

    const offers = parsed?.response?.trade_offers_sent ?? [];
    const offersSummary = offers.map((o: any) => ({
      tradeofferid: o.tradeofferid,
      accountid_other: o.accountid_other,
      accountid_other_type: typeof o.accountid_other,
      trade_offer_state: o.trade_offer_state,
      time_created: o.time_created,
      time_updated: o.time_updated,
    }));

    return successResponse({
      steamApi: {
        url: url.replace(apiKey, "***"),
        httpStatus: statusCode,
        httpOk: res.ok,
        elapsedMs: elapsed,
        rawBodyLength: rawText.length,
        parsedSuccessfully: parsed !== null,
      },
      trade: tradeContext,
      response: {
        totalSentOffers: offers.length,
        offers: offersSummary,
        fullResponseKeys: parsed?.response ? Object.keys(parsed.response) : [],
      },
      rawBodyPreview: rawText.slice(0, 2000),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
