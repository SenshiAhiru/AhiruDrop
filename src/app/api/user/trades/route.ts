import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAuth } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { notificationService } from "@/services/notification.service";
import { z } from "zod";

const TRADE_URL_REGEX = /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=\d+&token=[\w-]+$/;

const createSchema = z.object({
  winnerId: z.string().min(1),
  steamTradeUrl: z.string().regex(TRADE_URL_REGEX, "Trade URL inválida"),
});

/** List user's trade requests */
export async function GET() {
  try {
    const session = await requireAuth();
    const trades = await prisma.tradeRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        winner: {
          include: {
            draw: {
              include: {
                raffle: {
                  select: { id: true, title: true, slug: true, skinImage: true, skinName: true },
                },
              },
            },
          },
        },
      },
    });
    return successResponse({ data: trades });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Request a trade for a winning */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Dados inválidos", 422);
    }

    const { winnerId, steamTradeUrl } = parsed.data;

    // Verify this winner belongs to the user
    const winner = await prisma.winner.findUnique({
      where: { id: winnerId },
      include: {
        tradeRequest: true,
        draw: { include: { raffle: { select: { title: true } } } },
      },
    });

    if (!winner || winner.userId !== session.user.id) {
      return errorResponse("Vitória não encontrada", 404);
    }

    if (winner.tradeRequest) {
      return errorResponse("Trade já foi solicitado para esta vitória", 400);
    }

    // Save trade URL on user profile too (convenience for future trades)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { steamTradeUrl },
    });

    let trade;
    try {
      trade = await prisma.tradeRequest.create({
        data: {
          winnerId,
          userId: session.user.id,
          steamTradeUrl,
          status: "PENDING",
        },
      });
    } catch (dbErr: any) {
      console.error("[trades] create failed:", dbErr);
      return errorResponse(`Erro ao criar trade: ${dbErr.message?.slice(0, 200)}`, 500);
    }

    // Notify admins
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true },
      });
      await notificationService.sendToAdmins(
        "SYSTEM",
        "Nova solicitação de trade",
        `${user?.name ?? "Usuário"} solicitou o trade da skin "${winner.draw.raffle?.title ?? "rifa"}"`,
        { tradeId: trade.id, winnerId, link: "/admin/trades" }
      );
    } catch {}

    return successResponse(trade, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
