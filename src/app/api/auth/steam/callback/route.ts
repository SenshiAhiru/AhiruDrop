import { NextRequest, NextResponse } from "next/server";
import { verifySteamLogin, getSteamProfile } from "@/lib/steam-provider";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const STEAM_TOKEN_TTL_MS = 60 * 1000; // 60s window for /auth/steam-complete

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ahirudrop.vercel.app";

  try {
    const params = new URLSearchParams(req.nextUrl.search);

    // Verify Steam OpenID response
    const steamId = await verifySteamLogin(params);
    if (!steamId) {
      return NextResponse.redirect(`${appUrl}/login?error=SteamVerificationFailed`);
    }

    // Get Steam profile
    const apiKey = process.env.STEAM_API_KEY;
    if (!apiKey) {
      return NextResponse.redirect(`${appUrl}/login?error=SteamNotConfigured`);
    }

    const profile = await getSteamProfile(steamId, apiKey);
    if (!profile) {
      return NextResponse.redirect(`${appUrl}/login?error=SteamProfileFailed`);
    }

    // Find or create user by steamId
    // Check if user already linked this Steam account
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { steamId: steamId },
        ],
      },
    });

    if (!user) {
      // Check if there's a user with the same email pattern
      const steamEmail = `steam_${steamId}@ahirudrop.steam`;

      user = await prisma.user.findUnique({
        where: { email: steamEmail },
      });

      if (!user) {
        // Create new user from Steam profile
        const randomPassword = crypto.randomBytes(32).toString("hex");
        const passwordHash = await bcrypt.hash(randomPassword, 12);

        user = await prisma.user.create({
          data: {
            name: profile.personaname,
            email: steamEmail,
            passwordHash,
            role: "USER",
            avatarUrl: profile.avatarfull,
            steamId: steamId,
            isActive: true,
          },
        });
      }
    }

    // Refresh avatar from Steam each login (lightweight, expected by users).
    // Name is left untouched after first creation so users who renamed in
    // their profile don't have changes silently overwritten on next login.
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: profile.avatarfull },
    });

    // Issue a one-shot login token (60s TTL) that the steam-complete page
    // will exchange for a NextAuth session via signIn("credentials", { steamToken }).
    // Stored in its own table — NOT in SystemSetting — so admins can't forge
    // it through the settings PATCH endpoint.
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.steamLoginToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + STEAM_TOKEN_TTL_MS),
      },
    });

    return NextResponse.redirect(`${appUrl}/auth/steam-complete?token=${token}`);
  } catch (error) {
    console.error("Steam callback error:", error);
    return NextResponse.redirect(`${appUrl}/login?error=SteamError`);
  }
}
