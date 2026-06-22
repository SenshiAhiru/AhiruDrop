import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
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
      name: "steam",
      credentials: {
        steamToken: { label: "Steam Token", type: "text" },
      },
      async authorize(credentials) {
        // ── Steam OIDC path (the only login method) ──────────────────
        // The /auth/steam-complete page calls signIn with `steamToken`.
        // Token is single-use, expires in 60s, and is created by
        // /api/auth/steam/callback after Steam OpenID validation.
        const steamToken = credentials?.steamToken as string | undefined;
        if (!steamToken || steamToken.length === 0) return null;

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

      if (path.startsWith("/login")) {
        if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
        return true;
      }

      return true;
    },
  },
});
