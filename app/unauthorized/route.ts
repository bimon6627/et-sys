// app/unauthorized/route.ts
import { NextResponse } from "next/server";

export function GET() {
  const baseUrl = process.env.NEXTAUTH_URL;
  const response = NextResponse.redirect(
    new URL("/unauthorized/view", baseUrl)
  );

  // Delete the pkce.code_verifier cookie
  response.cookies.set("pkce.code_verifier", "", {
    maxAge: 0,
    path: "/",
  });

  return response;
}
