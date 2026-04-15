import { NextRequest } from "next/server";
import { requireAdmin, handleApiError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { buildCsv, csvResponse } from "@/lib/csv";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;

    const where: Prisma.AuditLogWhereInput = {};
    const action = searchParams.get("action");
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    const actorId = searchParams.get("actorId");

    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (actorId) where.actorId = actorId;

    const logs = await prisma.auditLog.findMany({
      where,
      include: { actor: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 10000,
    });

    const headers = [
      "id",
      "data_hora",
      "ator_nome",
      "ator_email",
      "acao",
      "tipo_entidade",
      "id_entidade",
      "ip",
      "metadata",
    ];

    const rows = logs.map((l) => [
      l.id,
      new Date(l.createdAt).toISOString(),
      l.actor.name,
      l.actor.email,
      l.action,
      l.entityType,
      l.entityId,
      l.ipAddress ?? "",
      l.metadata ? JSON.stringify(l.metadata) : "",
    ]);

    const body = buildCsv(headers, rows);
    const filename = `auditoria-${new Date().toISOString().split("T")[0]}.csv`;
    return csvResponse(filename, body);
  } catch (error) {
    return handleApiError(error);
  }
}
