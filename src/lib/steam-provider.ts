import type { OIDCConfig } from "next-auth/providers";

/**
 * Steam uses OpenID 2.0 which NextAuth doesn't natively support.
 * We implement Steam login as a custom credential flow:
 * 1. Redirect user to Steam OpenID login page
 * 2. Steam redirects back with identity assertion
 * 3. We verify the assertion and fetch user profile from Steam API
 */

const STEAM_OPENID_URL = "https://steamcommunity.com/openid/login";

export function getSteamLoginUrl(callbackUrl: string): string {
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": callbackUrl,
    "openid.realm": callbackUrl.replace(/\/api\/auth\/steam\/callback.*/, ""),
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });

  return `${STEAM_OPENID_URL}?${params.toString()}`;
}

export async function verifySteamLogin(
  params: URLSearchParams
): Promise<string | null> {
  // Change mode to check_authentication
  const verifyParams = new URLSearchParams(params);
  verifyParams.set("openid.mode", "check_authentication");

  const res = await fetch(STEAM_OPENID_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: verifyParams.toString(),
    signal: AbortSignal.timeout(10000),
  });

  const text = await res.text();

  if (!text.includes("is_valid:true")) {
    return null;
  }

  // Extract Steam ID from claimed_id
  const claimedId = params.get("openid.claimed_id");
  if (!claimedId) return null;

  const match = claimedId.match(/\/id\/(\d+)$/);
  return match ? match[1] : null;
}

export interface SteamProfile {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate: number;
  communityvisibilitystate: number;
}

export async function getSteamProfile(
  steamId: string,
  apiKey: string
): Promise<SteamProfile | null> {
  try {
    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();

    const players = data?.response?.players;
    if (!Array.isArray(players) || players.length === 0) return null;

    return players[0] as SteamProfile;
  } catch {
    return null;
  }
}
