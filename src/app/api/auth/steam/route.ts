import { NextRequest, NextResponse } from "next/server";
import { getSteamLoginUrl } from "@/lib/steam-provider";

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ahirudrop.vercel.app";
  const callbackUrl = `${appUrl}/api/auth/steam/callback`;
  const steamUrl = getSteamLoginUrl(callbackUrl);

  return NextResponse.redirect(steamUrl);
}
