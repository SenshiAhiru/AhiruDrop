import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError, requireAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { auditService } from "@/services/audit.service";
import { z } from "zod";

const adjustSchema = z.object({
  amount: z.number().finite(),
  reason: z.string().trim().min(3).max(200),
});

/**
 * Admin manual balance adjustment (credit or debit).
 * Positive amount = credit; negative = debit.
 * All adjustments are logged in the audit trail.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await requireAdmin();
    const { userId } = await params;

    const body = await req.json().catch(() => null);
    const parsed = adjustSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues?.[0]?.message ?? "Dados inválidos", 422);
    }

    const { amount, reason } = parsed.data;

    if (amount === 0) return errorResponse("Valor deve ser diferente de zero", 422);

    const result = await prisma.$transaction(async (tx) => {
      // Lock the row before computing the new balance — `FOR UPDATE` prevents
      // the lost-update anomaly when two admins adjust the same balance
      // concurrently in READ COMMITTED isolation.
      const rows = await tx.$queryRaw<{ balance: string }[]>`
        SELECT "balance"::text AS balance
        FROM "users"
        WHERE "id" = ${userId}
        FOR UPDATE
      `;
      if (rows.length === 0) throw new Error("Usuário não encontrado");

      const current = Number(rows[0].balance);
      const next = current + amount;

      if (next < 0) {
        throw new Error(
          `Operação resultaria em saldo negativo (${next.toFixed(2)} AHC). Saldo atual: ${current.toFixed(2)}`
        );
      }

      // Atomic increment via Prisma — combined with the FOR UPDATE lock above,
      // this is fully serialized within the transaction.
      const updated = await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: amount } },
        select: { balance: true },
      });

      return { previous: current, next: Number(updated.balance) };
    });

    await auditService.log(
      session.user.id,
      amount > 0 ? "USER_BALANCE_CREDITED" : "USER_BALANCE_DEBITED",
      "user",
      userId,
      {
        amount,
        reason,
        previousBalance: result.previous,
        newBalance: result.next,
      }
    );

    return successResponse({
      previousBalance: result.previous,
      newBalance: result.next,
      amount,
    });
  } catch (error) {
    if (error instanceof Error) {
      const known = ["Usuário não encontrado", "saldo negativo"];
      if (known.some((m) => error.message.includes(m))) {
        return errorResponse(error.message, 400);
      }
    }
    return handleApiError(error);
  }
}
