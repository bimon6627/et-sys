// auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { NextAuthConfig } from "next-auth";
import { prisma } from "./lib/prisma";

const config = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      // User and account are only present on the initial sign in
      if (user) {
        // Fetch user role from your database
        const userRecord = await prisma.whitelist.findUnique({
          where: { email: user.email as string },
        });

        if (userRecord) {
          token.role = userRecord.role; // Add role to the JWT
          token.email = userRecord.email; // Add email to the JWT
        }

        // IMPORTANT: Do NOT store account.access_token here unless you have a strong reason
        // and understand its implications (lifetime, refresh strategy).
        // It's a Google token, not your app's session token.
        // Your app's session token is the JWT itself.
      }
      return token; // The `token` object itself is your NextAuth.js JWT payload
    },

    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        // The session object passed to the client is now enriched with role and email.
        // You generally don't need a `session.accessToken` if you're using `auth()` helper
        // or just checking `session.user` existence.
      }
      return session;
    },

    async signIn({ profile }) {
      const unauthorized = "/unauthorized";
      if (!profile) return unauthorized;

      const user = await prisma.whitelist.findUnique({
        where: { email: profile.email as string },
      });

      return !!user || unauthorized;
    },

    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      // Example authorization logic:
      if (pathname.startsWith("/admin")) {
        // For admin pages, user must be authenticated AND have 'admin' role
        return !!auth && auth.user.role === "admin"; // Assumes 'admin' is the role name
      }
      if (pathname.includes("/dashboard")) return !!auth; // Simply authenticated
      return true; // Allow access to all other paths
    },
  },
  session: {
    strategy: "jwt", // Explicitly use JWT strategy for session management
  },
  // Optionally, you can add a secret for JWT signing in production
  // secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
