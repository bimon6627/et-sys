// actions/auth.ts
"use server";

import { signOut } from "@/auth"; // Adjust this import path

export async function signOutAction(redirectTo: string) {
  await signOut({ redirectTo });
}
