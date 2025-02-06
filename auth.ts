import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
const config = {
    providers: [Google, Credentials],
    pages: {
        signIn: "/"
    },

    callbacks: {
        authorized({request, auth}) {
            const { pathname } = request.nextUrl;
            if (pathname.includes('/dashboard')) return !!auth; {
                return true;
            }
        }
    }

} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);