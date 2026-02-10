import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/",
    error: "/unauthorized",
  },
  providers: [], // Providers are configured in auth.ts
  callbacks: {
    // 💡 1. Add the Session Callback here (Edge Safe)
    // This ensures middleware can see the permissions
    async session({ session, token }) {
      // Security check: if token is invalid, kill session
      if (token.error === "AccessRevoked" || !token.email) {
        return null as any;
      }

      // Map token fields to session user
      if (session.user) {
        session.user.role = (token.role as string) || "";
        session.user.permissions = (token.permissions as string[]) || [];
        session.user.email = token.email as string;
      }
      return session;
    },

    // 2. Authorized Callback
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;

      // We cast to 'any' here because the types are defined in auth.ts
      const userPermissions = (auth?.user as any)?.permissions || [];

      // 1. Protect all /hjem routes
      if (pathname.startsWith("/hjem")) {
        if (!isLoggedIn) {
          return false; // Redirects to signIn page
        }

        // 2. Protect /hjem/soknader
        if (pathname.endsWith("/hjem/soknader")) {
          if (!userPermissions.includes("case:read")) {
            return Response.redirect(new URL("/unauthorized", request.nextUrl));
          }
        }

        // 3. Protect /hjem/admin
        if (pathname.startsWith("/hjem/admin")) {
          if (!userPermissions.includes("admin:view")) {
            return Response.redirect(new URL("/unauthorized", request.nextUrl));
          }
        }
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
