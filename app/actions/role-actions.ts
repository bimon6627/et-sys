"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// Check if user is allowed to manage roles
async function checkAuth() {
  const session = await auth();
  const permissions = session?.user?.permissions || [];
  if (!permissions.includes("admin:view")) {
    throw new Error("Unauthorized");
  }
}

export async function saveRole(formData: FormData) {
  await checkAuth();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  // Get all checked permissions (they all share the name 'permissions')
  const permissionSlugs = formData.getAll("permissions") as string[];

  if (!name) throw new Error("Role name is required");

  const data = {
    name,
    permissions: {
      // This magic Prisma syntax resets relations and adds the new ones
      set: [],
      connect: permissionSlugs.map((slug) => ({ slug })),
    },
  };

  if (id) {
    // UPDATE existing role
    await prisma.role.update({
      where: { id: parseInt(id) },
      data,
    });
  } else {
    // CREATE new role
    await prisma.role.create({
      data: {
        name,
        permissions: {
          connect: permissionSlugs.map((slug) => ({ slug })),
        },
      },
    });
  }

  revalidatePath("/hjem/admin/roles");
}

export async function deleteRole(roleId: number) {
  await checkAuth();

  // Optional: Prevent deleting the ADMIN role to avoid locking yourself out
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (role?.name === "ADMIN") {
    throw new Error("Cannot delete the ADMIN role");
  }

  await prisma.role.delete({
    where: { id: roleId },
  });

  revalidatePath("/hjem/admin/roles");
}
