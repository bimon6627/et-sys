import NextAuth from "next-auth";
import Google, { GoogleProfile } from "next-auth/providers/google";
import { NextAuthConfig } from "next-auth";

const config: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,

      profile: (profile: GoogleProfile) => {
        return {
          ...profile,
          id: profile.sub,
          name: profile.name,
          firstname: profile.given_name ?? profile.name.split(" ")[0],
          lastname: profile.family_name ?? profile.name.split(" ")[-1],
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      if (pathname.includes("/dashboard")) return !!auth;
      {
        return true;
      }
    },

    async signIn({ profile }) {
      const allowedDomain = "elev.no";
      const emailDomain = profile?.email?.split("@")[1];
      if (emailDomain != allowedDomain) {
        return "/unauthorized";
      } else {
        return true;
      }
    },

    async jwt({ token, profile }) {
      if (profile) {
        token.sub = profile.sub ?? "";
        token.firstname = profile.given_name ?? "";
        token.lastname = profile.family_name ?? "";
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.firstname = token.firstname as string;
        session.user.lastname = token.lastname as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
