import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 },
  pages: {
    signIn: "/login",
    signOut: "/signout",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
        steamToken: { label: "Steam Token", type: "text" },
      },
      async authorize(credentials, request) {
        // ── Steam OIDC path ──────────────────────────────────────────
        // The /auth/steam-complete page calls signIn with `steamToken` only.
        // Token is single-use, expires in 60s, and is created by
        // /api/auth/steam/callback after Steam OpenID validation.
        const steamToken = credentials?.steamToken as string | undefined;
        if (steamToken && steamToken.length > 0) {
          const now = new Date();
          const tokenRow = await prisma.steamLoginToken.findUnique({
            where: { token: steamToken },
          });
          if (
            !tokenRow ||
            tokenRow.consumedAt !== null ||
            tokenRow.expiresAt <= now
          ) {
            return null;
          }
          // Atomic consume: only one signIn can win the token.
          const consumed = await prisma.steamLoginToken.updateMany({
            where: { token: steamToken, consumedAt: null },
            data: { consumedAt: now },
          });
          if (consumed.count !== 1) return null;

          const u = await prisma.user.findUnique({
            where: { id: tokenRow.userId },
          });
          if (!u || !u.isActive) return null;
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            image: u.avatarUrl,
          };
        }

        // ── Email + password path ────────────────────────────────────
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        // Rate limit por email (impede brute force em conta específica)
        const { rateLimit, getClientIp } = await import("@/lib/rate-limit");
        const emailCheck = rateLimit(email, {
          key: "login-by-email",
          limit: 5,
          windowMs: 15 * 60 * 1000,
        });
        if (!emailCheck.ok) {
          throw new Error(`Muitas tentativas. Tente novamente em ${emailCheck.resetInSec}s.`);
        }

        // Rate limit por IP (impede brute force massivo)
        const ip = (request as any)?.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        const ipCheck = rateLimit(ip, {
          key: "login-by-ip",
          limit: 20,
          windowMs: 15 * 60 * 1000,
        });
        if (!ipCheck.ok) {
          throw new Error(`Muitas tentativas. Tente novamente em ${ipCheck.resetInSec}s.`);
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.isActive) return null;

        // Steam-linked accounts MUST authenticate via the Steam OIDC flow
        // (/api/auth/steam/callback → /api/auth/steam/verify with one-shot token).
        // Block password login for these accounts entirely — there is no shared
        // password to verify (passwordHash holds a random value at sign-up time).
        if (email.endsWith("@ahirudrop.steam")) return null;

        // Normal password check
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as any).role;
        token.picture = user.image || null;
      }
      // Refresh avatar from DB periodically (every request)
      if (token.id && !user) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { avatarUrl: true, role: true },
          });
          if (dbUser) {
            token.picture = dbUser.avatarUrl || null;
            token.role = dbUser.role;
          }
        } catch {}
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.image = (token.picture as string) || undefined;
      }
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user?.role === "ADMIN" || auth?.user?.role === "SUPER_ADMIN";
      const path = nextUrl.pathname;

      if (path.startsWith("/admin")) return isAdmin;
      if (path.startsWith("/dashboard")) return isLoggedIn;

      if (path.startsWith("/login") || path.startsWith("/register")) {
        if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
        return true;
      }

      return true;
    },
  },
});
