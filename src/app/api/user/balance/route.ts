import { NextRequest } from "next/server";
import { successResponse, handleApiError, requireAuth } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true },
    });

    return successResponse({
      balance: Number(user?.balance || 0),
      currency: "AHC",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
