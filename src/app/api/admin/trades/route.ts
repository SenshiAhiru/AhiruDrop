import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAdmin,
  validateBody,
} from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { notificationService } from "@/services/notification.service";
import { auditService } from "@/services/audit.service";
import type { TradeStatus } from "@prisma/client";
import { z } from "zod";

const patchTradeSchema = z
  .object({
    tradeId: z.string().min(1, "tradeId obrigatório"),
    status: z.enum(["PENDING", "SENT", "COMPLETED", "FAILED", "CANCELLED"]).optional(),
    adminNotes: z.string().max(2000).optional(),
    steamTradeOfferId: z.string().regex(/^\d+$/, "Offer ID deve ser numérico").max(32).optional(),
  })
  .refine(
    (d) => d.status !== undefined || d.adminNotes !== undefined || d.steamTradeOfferId !== undefined,
    { message: "Nada para atualizar" }
  );

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

    const parsed = await validateBody(req, patchTradeSchema);
    if (parsed.error) return errorResponse(parsed.error, 422);
    const { tradeId, status, adminNotes, steamTradeOfferId } = parsed.data!;

    const trade = await prisma.tradeRequest.findUnique({
      where: { id: tradeId },
      include: {
        winner: {
          include: { draw: { include: { raffle: { select: { title: true } } } } },
        },
      },
    });
    if (!trade) return errorResponse("Trade não encontrado", 404);

    const updateData: {
      status?: TradeStatus;
      adminNotes?: string;
      steamTradeOfferId?: string;
      sentAt?: Date;
      completedAt?: Date;
    } = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (steamTradeOfferId) updateData.steamTradeOfferId = steamTradeOfferId.trim();
    if (status === "SENT" && !trade.sentAt) updateData.sentAt = new Date();
    if (status === "COMPLETED" && !trade.completedAt) {
      updateData.completedAt = new Date();
      // Also mark the winner as claimed
      await prisma.winner.update({
        where: { id: trade.winnerId },
        data: { claimedAt: new Date() },
      });
    }

    const updated = await prisma.tradeRequest.update({
      where: { id: tradeId },
      data: updateData,
    });

    // Notify the user
    const statusLabels: Record<string, string> = {
      SENT: "Trade enviado! Aceite no seu Steam.",
      COMPLETED: "Skin entregue com sucesso!",
      FAILED: "Trade falhou. Entre em contato com o suporte.",
      CANCELLED: "Trade cancelado.",
    };

    if (status && statusLabels[status]) {
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
      status ? "TRADE_STATUS_CHANGED" : "TRADE_UPDATED",
      "trade_request",
      tradeId,
      { status, adminNotes, steamTradeOfferId }
    );

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
