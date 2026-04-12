import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido").toLowerCase().trim(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(result.error.errors[0].message);
    }

    const { email } = result.data;

    // Check if user exists (but don't reveal this to the client)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // For now, log the token (email integration will come later)
      console.log(`[RESET TOKEN] User: ${email}, Token: ${resetToken}, Expires: ${resetTokenExpiry.toISOString()}`);

      // TODO: Store token in database and send email
      // await prisma.passwordResetToken.create({
      //   data: {
      //     token: resetToken,
      //     userId: user.id,
      //     expiresAt: resetTokenExpiry,
      //   },
      // });
      //
      // await sendResetEmail(email, resetToken);
    }

    // Always return success to prevent email enumeration
    return successResponse({
      message: "Se o email estiver cadastrado, você receberá um link de recuperação.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
