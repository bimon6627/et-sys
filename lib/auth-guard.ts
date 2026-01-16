import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();
    console.log(session)
  // The "Live Check" logic in auth.ts returns null if the user is banned/removed
  if (!session || !session.user) {
    // Perform the cleanup and redirect
    redirect("/session-expired");
  } else if (session.user.permissions.includes("FORCE_SIGNOUT")) {
    redirect("/session-expired");
  }

  return session;
}