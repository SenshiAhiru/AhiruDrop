import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return errorResponse("Token obrigatório", 400);

    const key = `steam_token:${token}`;
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) return errorResponse("Token inválido ou expirado", 401);

    const userId = setting.value;

    // Delete the token (one-time use)
    await prisma.systemSetting.delete({ where: { key } });

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return errorResponse("Usuário não encontrado", 404);

    return successResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      steamId: user.cpf?.replace("steam:", ""),
    });
  } catch (error) {
    console.error("Steam verify error:", error);
    return errorResponse("Erro ao verificar token", 500);
  }
}
