import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth(async (req) => {
  // req.auth contains the session and token
  const session = await req.auth;
  const kkPages = ["/dashboard/soknader"];
  const isKKPage = req.nextUrl.pathname in kkPages;
  const isAdminPage = req.nextUrl.pathname.startsWith("/dashboard/admin");

  if (isKKPage) {
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    } else {
      const role = await prisma.whitelist.findUnique({
        where: { email: session.user.email },
      });

      if (role !== "KONKOM" && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }
  }

  // If the path is not /dashboard/admin, or the user is an admin accessing it, allow access
  return NextResponse.next();
});

// Optionally, configure the matcher for specific paths
export const config = {
  matcher: ["/dashboard/:path*"],
};
