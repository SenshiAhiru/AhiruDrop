import { successResponse, handleApiError, requireAuth } from "@/lib/api-utils";
import { notificationService } from "@/services/notification.service";

/** Lightweight endpoint for bell badge polling. */
export async function GET() {
  try {
    const session = await requireAuth();
    const unread = await notificationService.countUnread(session.user.id);
    return successResponse({ unread });
  } catch (error) {
    return handleApiError(error);
  }
}
