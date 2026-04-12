import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
  requireAdmin,
} from "@/lib/api-utils";
import { raffleService } from "@/services/raffle.service";
import { auditService } from "@/services/audit.service";
import type { RaffleStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;

    const status = searchParams.get("status") as RaffleStatus | null;
    const search = searchParams.get("search") || undefined;
    const page = Number(searchParams.get("page") || "1");
    const limit = Math.min(Number(searchParams.get("limit") || "20"), 100);

    const result = await raffleService.list({
      status: status || undefined,
      search,
      page,
      limit,
    });

    return successResponse({
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: result.pages,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();

    let body: any;
    try {
      body = await req.json();
    } catch {
      return errorResponse("JSON inválido", 400);
    }

    // Validate required fields
    if (!body.title || !body.description) {
      return errorResponse("Título e descrição são obrigatórios", 422);
    }
    if (!body.pricePerNumber || !body.totalNumbers) {
      return errorResponse("Preço e total de números são obrigatórios", 422);
    }

    // Map form fields to service fields
    const createData = {
      title: String(body.title),
      description: String(body.description),
      pricePerNumber: Number(body.pricePerNumber),
      totalNumbers: Number(body.totalNumbers),
      minPerPurchase: Number(body.minPerPurchase || 1),
      maxPerPurchase: Number(body.maxPerPurchase || 10),
      status: body.status === "ACTIVE" ? "ACTIVE" : "DRAFT",
      // Map imageUrl -> featuredImage, drawDate -> scheduledDrawAt
      featuredImage: body.skinImage || body.imageUrl || body.featuredImage || undefined,
      scheduledDrawAt: body.drawDate || body.scheduledDrawAt
        ? new Date(body.drawDate || body.scheduledDrawAt)
        : undefined,
      isFeatured: Boolean(body.isFeatured),
      regulation: body.regulation || undefined,
      category: body.skinCategory || body.category || undefined,
      prizeType: body.prizeType || "skin",
      // CS2 Skin fields
      skinName: body.skinName || undefined,
      skinImage: body.skinImage || undefined,
      skinWeapon: body.skinWeapon || undefined,
      skinCategory: body.skinCategory || undefined,
      skinRarity: body.skinRarity || undefined,
      skinRarityColor: body.skinRarityColor || undefined,
      skinWear: body.skinWear || undefined,
      skinFloat: body.skinFloat != null ? Number(body.skinFloat) : undefined,
      skinStatTrak: Boolean(body.skinStatTrak),
      skinSouvenir: Boolean(body.skinSouvenir),
      skinExteriorMin: body.skinExteriorMin != null ? Number(body.skinExteriorMin) : undefined,
      skinExteriorMax: body.skinExteriorMax != null ? Number(body.skinExteriorMax) : undefined,
      skinMarketPrice: body.skinMarketPrice != null ? Number(body.skinMarketPrice) : undefined,
    };

    const raffle = await raffleService.create(createData);

    try {
      await auditService.log(
        session.user.id,
        "RAFFLE_CREATED",
        "raffle",
        raffle.id,
        { title: raffle.title }
      );
    } catch {
      // Audit log failure should not block raffle creation
    }

    return successResponse(raffle, 201);
  } catch (error) {
    console.error("POST /api/admin/raffles error:", error);
    return handleApiError(error);
  }
}
