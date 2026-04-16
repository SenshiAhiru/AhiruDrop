import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { notificationService } from "@/services/notification.service";
import { auditService } from "@/services/audit.service";
import type { TradeStatus } from "@prisma/client";

/** List all trade requests with filters */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status") as TradeStatus | null;
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(50, Number(searchParams.get("limit") || "50"));

    const where: any = {};
    if (status) where.status = status;

    const [trades, total] = await Promise.all([
      prisma.tradeRequest.findMany({
        where,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true, steamId: true } },
          winner: {
            include: {
              draw: {
                include: {
                  raffle: {
                    select: { id: true, title: true, slug: true, skinImage: true, skinName: true, skinRarity: true, skinRarityColor: true },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.tradeRequest.count({ where }),
    ]);

    const pendingCount = await prisma.tradeRequest.count({ where: { status: "PENDING" } });

    return successResponse({
      data: trades,
      total,
      pages: Math.ceil(total / limit),
      pendingCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Update trade status */
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await req.json().catch(() => null);

    const { tradeId, status, adminNotes } = body ?? {};
    if (!tradeId || !status) return errorResponse("tradeId e status obrigatórios", 422);

    const validStatuses: TradeStatus[] = ["PENDING", "SENT", "COMPLETED", "FAILED", "CANCELLED"];
    if (!validStatuses.includes(status)) return errorResponse("Status inválido", 422);

    const trade = await prisma.tradeRequest.findUnique({
      where: { id: tradeId },
      include: {
        winner: {
          include: { draw: { include: { raffle: { select: { title: true } } } } },
        },
      },
    });
    if (!trade) return errorResponse("Trade não encontrado", 404);

    const data: any = { status };
    if (adminNotes !== undefined) data.adminNotes = adminNotes;
    if (status === "SENT" && !trade.sentAt) data.sentAt = new Date();
    if (status === "COMPLETED" && !trade.completedAt) {
      data.completedAt = new Date();
      // Also mark the winner as claimed
      await prisma.winner.update({
        where: { id: trade.winnerId },
        data: { claimedAt: new Date() },
      });
    }

    const updated = await prisma.tradeRequest.update({
      where: { id: tradeId },
      data,
    });

    // Notify the user
    const statusLabels: Record<string, string> = {
      SENT: "Trade enviado! Aceite no seu Steam.",
      COMPLETED: "Skin entregue com sucesso!",
      FAILED: "Trade falhou. Entre em contato com o suporte.",
      CANCELLED: "Trade cancelado.",
    };

    if (statusLabels[status]) {
      try {
        await notificationService.create(
          trade.userId,
          "SYSTEM",
          statusLabels[status],
          `Atualização da skin "${trade.winner.draw.raffle?.title ?? "rifa"}": ${statusLabels[status]}`,
          { tradeId, link: "/dashboard/winnings" }
        );
      } catch {}
    }

    await auditService.log(
      session.user.id,
      "TRADE_STATUS_CHANGED",
      "trade_request",
      tradeId,
      { status, adminNotes }
    );

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
