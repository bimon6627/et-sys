"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// --- SECURITY HELPER ---
async function checkAdminAuth() {
  const session = await auth();
  const permissions = session?.user?.permissions || [];
  // Ensure the user has admin view permissions (or specific config permissions)
  if (!permissions.includes("admin:view")) {
    throw new Error("Unauthorized");
  }
}

// --- REGION ACTIONS ---

export async function createRegion(name: string, internal: boolean) {
  await checkAdminAuth();
  try {
    await prisma.region.create({
      data: { name, internal },
    });
    revalidatePath("/hjem/admin/regions");
    return { success: true };
  } catch (_e) {
    return {
      success: false,
      message: "Kunne ikke opprette region. Navnet må være unikt.",
    };
  }
}

export async function deleteRegion(id: number) {
  await checkAdminAuth();
  try {
    await prisma.region.delete({ where: { id } });
    revalidatePath("/hjem/admin/regions");
    return { success: true };
  } catch (_e) {
    return {
      success: false,
      message:
        "Kan ikke slette region med tilknyttede deltakere eller organisasjoner.",
    };
  }
}

// --- ORGANIZATION ACTIONS ---

export async function createOrganization(
  name: string,
  regionId: number,
  canVote: boolean,
) {
  await checkAdminAuth();
  try {
    await prisma.organization.create({
      data: { name, regionId, canVote },
    });
    revalidatePath("/hjem/admin/regions");
    return { success: true };
  } catch (_e) {
    return { success: false, message: "Kunne ikke opprette organisasjon." };
  }
}

export async function deleteOrganization(id: number) {
  await checkAdminAuth();
  try {
    await prisma.organization.delete({ where: { id } });
    revalidatePath("/hjem/admin/regions");
    return { success: true };
  } catch (_e) {
    return {
      success: false,
      message: "Kan ikke slette organisasjon med tilknyttede deltakere.",
    };
  }
}
