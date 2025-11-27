import { redirect, forbidden } from "next/navigation"; // Import forbidden
import { hasPermission } from "@/lib/rbac";
import { auth } from "@/auth";

interface ProtectProps {
  permission: string;
  children: React.ReactNode;
}

export async function Protect({ permission, children }: ProtectProps) {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/"); // Not logged in -> Redirect to home page
  }

  const granted = await hasPermission(userEmail, permission);

  if (!granted) {
    forbidden(); // Logged in but wrong role -> Render forbidden.tsx
  }

  return <>{children}</>;
}
