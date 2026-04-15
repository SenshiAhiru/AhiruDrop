import { NextRequest } from "next/server";
import { requireAdmin, handleApiError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { buildCsv, csvResponse } from "@/lib/csv";
import type { Prisma, OrderStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;

    const where: Prisma.OrderWhereInput = {};
    const status = searchParams.get("status") as OrderStatus | null;
    const search = searchParams.get("search");
    const userId = searchParams.get("userId");

    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (search) {
      where.OR = [
        { id: { contains: search } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: { raffle: { select: { title: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10000,
    });

    const headers = [
      "id",
      "data",
      "cliente_nome",
      "cliente_email",
      "status",
      "total_ahc",
      "desconto_ahc",
      "final_ahc",
      "qtd_itens",
      "rifas",
    ];

    const rows = orders.map((o) => [
      o.id,
      new Date(o.createdAt).toISOString(),
      o.user.name,
      o.user.email,
      o.status,
      Number(o.totalAmount).toFixed(2),
      Number(o.discount).toFixed(2),
      Number(o.finalAmount).toFixed(2),
      o.items.reduce((sum, i) => sum + i.quantity, 0),
      o.items.map((i) => `${i.quantity}x ${i.raffle?.title ?? "—"}`).join(" | "),
    ]);

    const body = buildCsv(headers, rows);
    const filename = `pedidos-${new Date().toISOString().split("T")[0]}.csv`;
    return csvResponse(filename, body);
  } catch (error) {
    return handleApiError(error);
  }
}
