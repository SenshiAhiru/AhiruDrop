import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAdmin,
} from "@/lib/api-utils";
import { raffleService } from "@/services/raffle.service";
import { auditService } from "@/services/audit.service";
import { z } from "zod";

// Whitelist of editable raffle fields. Zod strips unknown keys by default, so
// this blocks mass-assignment (id, slug, serverSeed*, drawBlockHeight, winner,
// timestamps, etc.) that passing the raw body to the service would allow.
// Numeric/date fields arrive as strings from the admin form → coerce them.
// (Status transitions still go through the dedicated updateStatus path below.)
const emptyToUndef = (v: unknown) => (v === "" ? undefined : v);

const updateRaffleSchema = z.object({
  title: z.string().trim().min(1).optional(),
  titleEn: z.string().trim().optional(),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  shortDescription: z.string().optional(),
  shortDescriptionEn: z.string().optional(),
  pricePerNumber: z.preprocess(emptyToUndef, z.coerce.number().positive().optional()),
  totalNumbers: z.preprocess(emptyToUndef, z.coerce.number().int().positive().optional()),
  minPerPurchase: z.preprocess(emptyToUndef, z.coerce.number().int().positive().optional()),
  maxPerPurchase: z.preprocess(emptyToUndef, z.coerce.number().int().positive().optional()),
  category: z.string().optional(),
  prizeType: z.string().optional(),
  regulation: z.string().optional(),
  regulationEn: z.string().optional(),
  featuredImage: z.string().optional(),
  scheduledDrawAt: z.preprocess(emptyToUndef, z.coerce.date().optional()),
  isFeatured: z.boolean().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "CLOSED", "DRAWN", "CANCELLED"]).optional(),
  // CS2 skin fields
  skinName: z.string().optional(),
  skinImage: z.string().optional(),
  skinWeapon: z.string().optional(),
  skinCategory: z.string().optional(),
  skinRarity: z.string().optional(),
  skinRarityColor: z.string().optional(),
  skinWear: z.string().optional(),
  skinFloat: z.preprocess(emptyToUndef, z.coerce.number().nullable().optional()),
  skinStatTrak: z.boolean().optional(),
  skinSouvenir: z.boolean().optional(),
  skinExteriorMin: z.preprocess(emptyToUndef, z.coerce.number().nullable().optional()),
  skinExteriorMax: z.preprocess(emptyToUndef, z.coerce.number().nullable().optional()),
  skinMarketPrice: z.preprocess(emptyToUndef, z.coerce.number().nullable().optional()),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ raffleId: string }> }
) {
  try {
    await requireAdmin();
    const { raffleId } = await params;

    const raffle = await raffleService.getById(raffleId);
    if (!raffle) {
      return errorResponse("Rifa não encontrada", 404);
    }

    return successResponse(raffle);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ raffleId: string }> }
) {
  try {
    const session = await requireAdmin();
    const { raffleId } = await params;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return errorResponse("JSON inválido", 400);
    }

    // If only changing status, use the status transition method
    if (body.status && Object.keys(body).length === 1) {
      const updated = await raffleService.updateStatus(raffleId, body.status);
      try {
        await auditService.log(
          session.user.id,
          "RAFFLE_STATUS_CHANGED",
          "raffle",
          raffleId,
          { newStatus: body.status }
        );
      } catch {}
      return successResponse(updated);
    }

    // General update — validate + strip unknown fields before hitting the service.
    const parsed = updateRaffleSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        422
      );
    }

    const updated = await raffleService.update(raffleId, parsed.data);

    try {
      await auditService.log(
        session.user.id,
        "RAFFLE_UPDATED",
        "raffle",
        raffleId,
        { changes: Object.keys(parsed.data) }
      );
    } catch {}

    return successResponse(updated);
  } catch (error) {
    console.error("PATCH raffle error:", error);
    if (error instanceof Error) {
      if (error.message === "Rifa não encontrada") {
        return errorResponse(error.message, 404);
      }
      if (error.message.includes("Não é possível") || error.message.includes("Transição")) {
        return errorResponse(error.message, 400);
      }
    }
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ raffleId: string }> }
) {
  try {
    const session = await requireAdmin();
    const { raffleId } = await params;

    await raffleService.delete(raffleId);

    try {
      await auditService.log(
        session.user.id,
        "RAFFLE_DELETED",
        "raffle",
        raffleId
      );
    } catch {}

    return successResponse({ message: "Rifa excluída com sucesso" });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Rifa não encontrada") {
        return errorResponse(error.message, 404);
      }
      if (error.message.includes("Apenas rifas em rascunho")) {
        return errorResponse(error.message, 400);
      }
    }
    return handleApiError(error);
  }
}
