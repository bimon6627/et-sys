import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  // In NextAuth v5 wrapper, req.auth IS the session object
  const session = req.auth;
  const { pathname } = req.nextUrl;

  // safe access to permissions
  const permissions = session?.user?.permissions || [];

  // 1. Protect all /dashboard routes (Authentication)
  if (pathname.startsWith("/dashboard")) {
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 2. Protect /dashboard/soknader (Authorization)
    // CHANGED: Check for 'case:read' permission instead of "KONKOM"/"ADMIN" role
    if (pathname.startsWith("/dashboard/soknader")) {
      if (!permissions.includes("case:read")) {
        // Redirect to your forbidden/unauthorized page
        // Note: Middleware cannot render the 'forbidden.tsx' component directly,
        // so we redirect to a dedicated error page or root.
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // 3. Protect /dashboard/admin
    if (pathname.startsWith("/dashboard/admin")) {
      if (!permissions.includes("admin:view")) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  // Match all dashboard routes
  matcher: ["/dashboard/:path*"],
};
