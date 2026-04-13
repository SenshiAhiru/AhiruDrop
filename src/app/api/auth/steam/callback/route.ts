import { NextRequest, NextResponse } from "next/server";
import { verifySteamLogin, getSteamProfile } from "@/lib/steam-provider";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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
          { cpf: `steam:${steamId}` }, // We use cpf field to store steam ID
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
            cpf: `steam:${steamId}`, // Store Steam ID
            isActive: true,
          },
        });
      }
    }

    // Update avatar and name from Steam on each login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        avatarUrl: profile.avatarfull,
        name: profile.personaname,
      },
    });

    // Sign in the user using NextAuth credentials
    // We redirect to a special page that auto-signs in
    const token = crypto.randomBytes(32).toString("hex");

    // Store temporary token for auto-login
    await prisma.systemSetting.upsert({
      where: { key: `steam_token:${token}` },
      update: { value: user.id },
      create: {
        key: `steam_token:${token}`,
        value: user.id,
        type: "string",
      },
    });

    return NextResponse.redirect(`${appUrl}/auth/steam-complete?token=${token}`);
  } catch (error) {
    console.error("Steam callback error:", error);
    return NextResponse.redirect(`${appUrl}/login?error=SteamError`);
  }
}
