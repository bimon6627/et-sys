import NextAuth from "next-auth";
import { authConfig } from "./auth.config"; // 💡 Import CONFIG, not the main auth file

// This initializes NextAuth with ONLY the edge-compatible config for the middleware
export default NextAuth(authConfig).auth;

export const config = {
  // Match all dashboard routes
  matcher: ["/dashboard/:path*"],
};