import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSteamLoginUrl } from "@/lib/steam-provider";
import { errorResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return errorResponse("Não autenticado", 401);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ahirudrop.vercel.app";
  const callbackUrl = `${appUrl}/api/auth/steam/link/callback`;
  const steamUrl = getSteamLoginUrl(callbackUrl);

  return NextResponse.redirect(steamUrl);
}
