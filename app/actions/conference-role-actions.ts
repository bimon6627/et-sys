"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// --- HELPERS ---

async function getConferenceContext(shortname: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const conference = await prisma.conference.findUnique({
    where: { shortname },
    select: { id: true, regionId: true },
  });

  if (!conference) throw new Error("Conference not found");

  // TODO: Insert your robust "Hybrid Permission Check" here.
  // For now, we assume if they can access the settings page, they have write access.
  // In production: verify user.permissions includes 'conference:write'
  // OR ('conference:write_regional' AND region match).

  return conference;
}

// --- FETCHERS ---

export async function getConferenceRoles(shortname: string) {
  const conference = await prisma.conference.findUnique({
    where: { shortname },
    select: { id: true },
  });

  if (!conference) return [];

  // Fetch both Global Templates (conferenceId: null) AND Custom Roles
  return await prisma.conferenceRole.findMany({
    where: {
      OR: [
        { conferenceId: null }, // Global Templates
        { conferenceId: conference.id }, // Custom Roles
      ],
    },
    include: {
      permissions: true, // We need to see what they can do
      _count: { select: { organizer: true } }, // Show how many staff use this role
    },
    orderBy: { name: "asc" },
  });
}

export async function getSafePermissions() {
  // Only return permissions that are NOT system-level
  // Local admins should only be able to assign "participant:read", not "users:delete"
  return await prisma.permission.findMany({
    where: { isSystemPermission: false },
    orderBy: { slug: "asc" },
  });
}

// --- MUTATIONS ---

export async function saveConferenceRole(
  shortname: string,
  formData: FormData,
) {
  const conference = await getConferenceContext(shortname);

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  // Get all checked permission slugs
  const permissionSlugs = formData.getAll("permissions") as string[];

  if (!name) throw new Error("Role name is required");

  // 1. SAFETY: Ensure we don't accidentally add system permissions
  // Fetch the requested permissions and verify they are safe
  const validPermissions = await prisma.permission.findMany({
    where: {
      slug: { in: permissionSlugs },
      isSystemPermission: false,
    },
    select: { id: true },
  });

  const dataPayload = {
    name,
    description,
    permissions: {
      set: validPermissions.map((p) => ({ id: p.id })),
    },
  };

  if (id) {
    // UPDATE existing role
    // Security: Ensure this role actually belongs to this conference!
    const existing = await prisma.conferenceRole.findUnique({
      where: { id: Number(id) },
    });

    if (existing?.conferenceId !== conference.id) {
      throw new Error(
        "Du kan ikke redigere globale mal-roller eller roller fra andre konferanser.",
      );
    }

    await prisma.conferenceRole.update({
      where: { id: Number(id) },
      data: dataPayload,
    });
  } else {
    // CREATE new role
    await prisma.conferenceRole.create({
      data: {
        ...dataPayload,
        permissions: {
          connect: validPermissions.map((p) => ({ id: p.id })),
        },
        conferenceId: conference.id, // Link to THIS conference
      },
    });
  }

  revalidatePath(`/hjem/${shortname}/innstillinger/roller`);
  return { success: true };
}

export async function deleteConferenceRole(shortname: string, roleId: number) {
  const conference = await getConferenceContext(shortname);

  // Security: Ensure ownership
  const role = await prisma.conferenceRole.findUnique({
    where: { id: roleId },
  });

  if (!role || role.conferenceId !== conference.id) {
    throw new Error(
      "Cannot delete global roles or roles from other conferences.",
    );
  }

  // Optional: Check if used
  const usageCount = await prisma.conferenceOrganizer.count({
    where: { roleId },
  });
  if (usageCount > 0) {
    throw new Error("Kan ikke slette en rolle som er i bruk av arrangører.");
  }

  await prisma.conferenceRole.delete({ where: { id: roleId } });
  revalidatePath(`/hjem/${shortname}/innstillinger/roller`);
  return { success: true };
}
