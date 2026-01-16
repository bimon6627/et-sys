import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "./lib/prisma";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      role?: string;
      permissions: string[];
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: string;
    permissions: string[];
    error?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.email) return false;
      const user = await prisma.whitelist.findUnique({
        where: { email: profile.email.toLowerCase() },
      });
      return !!user;
    },

    async jwt({ token, user }) {
      const email = (user?.email || token.email || "").toLowerCase();
      if (!email) return token;

      try {
        const userRecord = await prisma.whitelist.findUnique({
          where: { email },
          include: { role: { include: { permissions: true } } },
        });
        
        console.log("User Record Found:", !!userRecord);

        if (!userRecord) {
          token.permissions = ["FORCE_SIGNOUT"]; 
           token.role = "GUEST";
           return token;
        }

        token.role = userRecord.role?.name;
        token.permissions = userRecord.role?.permissions.map((p) => p.slug) ?? [];
        token.email = userRecord.email;
        delete token.error; // Clear error if they are back in whitelist

      } catch (error) {
        return { ...token, error: "DatabaseError" };
      }
      
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) || "";
        session.user.permissions = (token.permissions as string[]) || [];
        session.user.email = token.email as string;
      }
      return session;
    },
  },
});