// app/unauthorized/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(
    new URL("/unauthorized/view", request.url)
  );

  // Delete the pkce.code_verifier cookie
  response.cookies.set("pkce.code_verifier", "", {
    maxAge: 0,
    path: "/",
  });

  return response;
}
