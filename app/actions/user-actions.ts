"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// Check if user is allowed to manage users
async function checkAuth() {
  const session = await auth();
  const permissions = session?.user?.permissions || [];
  if (!permissions.includes("users:write")) {
    throw new Error("Unauthorized: Missing 'users:write' permission.");
  }
}

export async function createWhitelistUser(formData: FormData) {
  await checkAuth();

  const email = formData.get("email") as string;
  const roleId = formData.get("roleId") as string;
  const regionId = formData.get("regionId") as string;

  if (!email || !roleId || !regionId) {
    throw new Error("Missing required fields.");
  }

  try {
    const numericRoleId = parseInt(roleId);
    const numericRegionId = parseInt(regionId);

    await prisma.whitelist.create({
      data: {
        email: email,
        // Connect the Role and Region using their IDs
        role: { connect: { id: numericRoleId } },
        region: { connect: { id: numericRegionId } },
      },
    });

    revalidatePath("/hjem/admin/users");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        success: false,
        message: `Brukeren med e-post ${email} eksisterer allerede.`,
      };
    }
    console.error("Error creating user:", error);
    return { success: false, message: "Kunne ikke opprette bruker." };
  }
}

export async function deleteWhitelistUser(userId: number) {
  await checkAuth(); // Ensures only authorized users can delete

  try {
    await prisma.whitelist.delete({
      where: { id: userId },
    });

    // Invalidate the path to force the user list to refresh
    revalidatePath("/hjem/admin/users");

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, message: "Kunne ikke slette bruker." };
  }
}

export async function updateWhitelistUser(
  userId: number,
  roleId: number,
  regionId: number | null,
) {
  await checkAuth();

  try {
    await prisma.whitelist.update({
      where: { id: userId },
      data: {
        role: { connect: { id: roleId } },
        // If regionId is provided, connect it; otherwise, disconnect (set to null)
        region: regionId ? { connect: { id: regionId } } : { disconnect: true },
      },
    });

    revalidatePath("/hjem/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, message: "Kunne ikke oppdatere bruker." };
  }
}
