import { NextRequest } from "next/server";
import { successResponse, handleApiError, requireAuth } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = req.nextUrl;

    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || "20")));

    const where = { userId: session.user.id };

    const [rows, total] = await Promise.all([
      prisma.deposit.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.deposit.count({ where }),
    ]);

    const data = rows.map((d) => ({
      id: d.id,
      paymentIntentId: d.paymentIntentId,
      currency: d.currency,
      amountPaid: Number(d.amountPaid),
      ahcBase: Number(d.ahcBase),
      ahcBonus: Number(d.ahcBonus),
      ahcTotal: Number(d.ahcTotal),
      couponCode: d.couponCode,
      status: d.status,
      completedAt: d.completedAt,
      createdAt: d.createdAt,
    }));

    return successResponse({
      data,
      total,
      pages: Math.ceil(total / limit),
      page,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
