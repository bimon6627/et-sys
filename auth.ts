import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { NextAuthConfig } from "next-auth";
import { prisma } from "./lib/prisma";

const config: NextAuthConfig = {
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
    // This callback runs when the JWT is created or updated
    async jwt({ token, user }) {
      // If the user is logging in for the first time (user is available)
      if (user) {
        // Fetch the user role from your database
        const userRecord = await prisma.whitelist.findUnique({
          where: { email: user.email as string },
        });

        if (userRecord) {
          // Attach the role to the JWT token
          token.role = userRecord.role;
          token.email = userRecord.email;
        }
      }
      return token;
    },

    // This callback runs when the session is created or accessed
    async session({ session, token }) {
      // Attach the role and email from the token to the session
      if (token) {
        session.user.role = token.role as string; // Attach role from token to session
        session.user.email = token.email as string; // Attach email from token to session
      }
      return session;
    },

    async signIn({ profile }) {
      const unauthorized = "/unauthorized";
      if (!profile) return unauthorized;

      // Check if the user's email is in the whitelist
      const user = await prisma.whitelist.findUnique({
        where: { email: profile.email as string },
      });

      return !!user || unauthorized; // Return true if user is in whitelist, else redirect to unauthorized
    },

    // Check if the user is authorized to view certain pages
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      if (pathname.includes("/dashboard")) return !!auth; // Only allow access to dashboard if user is authenticated
      return true;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
