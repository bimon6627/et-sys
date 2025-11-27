import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { NextAuthConfig } from "next-auth";
import { prisma } from "./lib/prisma";

// 1. Extend TypeScript types to recognize your new fields
declare module "next-auth" {
  interface Session {
    user: {
      role?: string;
      permissions: string[]; // Add this array of slugs
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: string;
    permissions: string[];
  }
}

const config = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
  ],
  pages: {
    signIn: "/",
    error: "/unauthorized", // Good practice to redirect here on auth failures
  },
  callbacks: {
    async jwt({ token, user }) {
      // User is only present on initial sign-in
      if (user) {
        // 2. Fetch User + Role + Permissions
        const userRecord = await prisma.whitelist.findUnique({
          where: { email: user.email as string },
          include: {
            role: {
              include: {
                permissions: true, // Load the permissions!
              },
            },
          },
        });

        if (userRecord) {
          // 3. Store simplified data in the Token
          // We don't want the whole object, just the name and slugs
          token.role = userRecord.role?.name;
          token.permissions =
            userRecord.role?.permissions.map((p) => p.slug) ?? [];
          token.email = userRecord.email;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        // 4. Pass data from Token to Session (Client Side Access)
        session.user.role = token.role || "";
        session.user.permissions = token.permissions || [];
        session.user.email = token.email || "";
      }
      return session;
    },

    async signIn({ profile }) {
      if (!profile?.email) return "/unauthorized";

      const user = await prisma.whitelist.findUnique({
        where: { email: profile.email },
      });

      // If user is not in whitelist, block sign in
      return !!user;
    },

    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      const userPermissions = auth?.user?.permissions || [];

      // 5. Example: Admin Route Protection
      if (pathname.startsWith("/admin")) {
        // Check if they are logged in AND have the 'ADMIN' role name
        return isLoggedIn && userRole === "ADMIN";
      }

      // 6. Example: Granular Permission Check
      // If you have a route that requires 'case:read' permission
      if (pathname.startsWith("/cases")) {
        return isLoggedIn && userPermissions.includes("case:read");
      }

      // Dashboard just requires login
      if (pathname.includes("/dashboard")) return isLoggedIn;

      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
