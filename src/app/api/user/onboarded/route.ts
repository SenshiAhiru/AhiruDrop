import { successResponse, handleApiError, requireAuth } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/onboarded — returns { onboarded: boolean } for current user
 */
export async function GET() {
  try {
    const session = await requireAuth();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardedAt: true },
    });
    return successResponse({
      onboarded: Boolean(user?.onboardedAt),
      onboardedAt: user?.onboardedAt ?? null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/user/onboarded — marks current user as onboarded
 */
export async function POST() {
  try {
    const session = await requireAuth();
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardedAt: new Date() },
      select: { onboardedAt: true },
    });
    return successResponse({ onboarded: true, onboardedAt: updated.onboardedAt });
  } catch (error) {
    return handleApiError(error);
  }
}
