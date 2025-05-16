import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Make sure the path is correct

export default auth(async (req) => {
  const session = await req.auth;
  const { pathname } = req.nextUrl;

  // Protect all /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL("/", req.url)); // Redirect to sign-in page
    }

    // Additional check: /dashboard/soknader requires KONKOM or ADMIN
    if (pathname === "/dashboard/soknader") {
      if (session?.user?.role !== "KONKOM" && session?.user?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // You can add more route-specific logic here if needed
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
