import { NextRequest } from "next/server";
import { requireAdmin, handleApiError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { buildCsv, csvResponse } from "@/lib/csv";
import type { Prisma, Role } from "@prisma/client";

/**
 * CSV export of users honoring the same filters as the list endpoint.
 * Includes aggregate stats (balance, orderCount, totalSpent, winCount).
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;

    const role = searchParams.get("role") as Role | null;
    const search = searchParams.get("search") || undefined;
    const isActiveParam = searchParams.get("isActive");

    const where: Prisma.UserWhereInput = {};
    if (role) where.role = role;
    if (isActiveParam === "true") where.isActive = true;
    if (isActiveParam === "false") where.isActive = false;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { cpf: { contains: search } },
        { steamId: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        steamId: true,
        role: true,
        balance: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    const userIds = users.map((u) => u.id);

    const [spending, winCounts] = await Promise.all([
      userIds.length > 0
        ? prisma.order.groupBy({
            by: ["userId"],
            where: { userId: { in: userIds }, status: "CONFIRMED" },
            _sum: { finalAmount: true },
            _count: true,
          })
        : [],
      userIds.length > 0
        ? prisma.winner.groupBy({
            by: ["userId"],
            where: { userId: { in: userIds } },
            _count: true,
          })
        : [],
    ]);

    const spentById = new Map(
      spending.map((s) => [s.userId, Number(s._sum.finalAmount || 0)])
    );
    const ordersById = new Map(spending.map((s) => [s.userId, s._count]));
    const winsById = new Map(winCounts.map((w) => [w.userId, w._count]));

    // Build CSV
    const headers = [
      "id",
      "nome",
      "email",
      "telefone",
      "cpf",
      "steamId",
      "role",
      "ativo",
      "email_verificado",
      "saldo_ahc",
      "pedidos_confirmados",
      "gasto_total_ahc",
      "vitorias",
      "cadastrado_em",
    ];

    const rows = users.map((u) => [
      u.id,
      u.name,
      u.email,
      u.phone ?? "",
      u.cpf ?? "",
      u.steamId ?? "",
      u.role,
      u.isActive ? "sim" : "nao",
      u.emailVerified ? "sim" : "nao",
      Number(u.balance).toFixed(2),
      String(ordersById.get(u.id) ?? 0),
      (spentById.get(u.id) ?? 0).toFixed(2),
      String(winsById.get(u.id) ?? 0),
      new Date(u.createdAt).toISOString(),
    ]);

    const body = buildCsv(headers, rows);
    const filename = `usuarios-${new Date().toISOString().split("T")[0]}.csv`;
    return csvResponse(filename, body);
  } catch (error) {
    return handleApiError(error);
  }
}
