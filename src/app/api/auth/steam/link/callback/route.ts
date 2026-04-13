import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifySteamLogin, getSteamProfile } from "@/lib/steam-provider";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ahirudrop.vercel.app";

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(`${appUrl}/dashboard/profile?steam=error&reason=not_authenticated`);
    }

    const params = new URLSearchParams(req.nextUrl.search);

    // Verify Steam OpenID response
    const steamId = await verifySteamLogin(params);
    if (!steamId) {
      return NextResponse.redirect(`${appUrl}/dashboard/profile?steam=error&reason=verification_failed`);
    }

    // Check if this Steam ID is already linked to another account
    const existingUser = await prisma.user.findFirst({
      where: { cpf: `steam:${steamId}` },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.redirect(`${appUrl}/dashboard/profile?steam=error&reason=already_linked`);
    }

    // Get Steam profile for avatar and name
    const apiKey = process.env.STEAM_API_KEY;
    if (!apiKey) {
      return NextResponse.redirect(`${appUrl}/dashboard/profile?steam=error&reason=not_configured`);
    }

    const profile = await getSteamProfile(steamId, apiKey);

    // Link Steam to current user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        cpf: `steam:${steamId}`,
        avatarUrl: profile?.avatarfull || undefined,
      },
    });

    return NextResponse.redirect(`${appUrl}/dashboard/profile?steam=success&name=${encodeURIComponent(profile?.personaname || steamId)}`);
  } catch (error) {
    console.error("Steam link callback error:", error);
    return NextResponse.redirect(`${appUrl}/dashboard/profile?steam=error&reason=unknown`);
  }
}
