"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// --- SECURITY HELPERS ---

async function getUserContext() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await prisma.whitelist.findUnique({
    where: { email: session.user.email },
    include: { role: { include: { permissions: true } } },
  });

  if (!user) return null;

  const permissions = user.role?.permissions.map((p) => p.slug) || [];

  return {
    id: user.id,
    regionId: user.regionId,
    permissions,
  };
}

export async function getAllRegions() {
  try {
    return await prisma.region.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true }, // We only need ID and Name
    });
  } catch (error) {
    return [];
  }
}

// --- FETCH ACTIONS ---
// (Kept as is, assuming logic works for your needs)
export async function getAvailableConferences() {
  const user = await getUserContext();
  if (!user) return [];

  const canReadAll = user.permissions.includes("conference:read");
  const canReadRegional = user.permissions.includes("conference:read_regional");

  if (!canReadAll && !canReadRegional) return [];

  try {
    const whereClause: any = {};

    if (canReadAll) {
      // Admins see everything
    } else if (canReadRegional) {
      // Regional users see: Their region OR Global conferences
      whereClause.OR = [{ regionId: user.regionId }, { regionId: null }];
    }

    const conferences = await prisma.conference.findMany({
      where: whereClause,
      include: {
        region: { select: { name: true, id: true } },
        _count: { select: { participants: true } },
      },
      orderBy: [{ active: "desc" }, { startDate: "desc" }],
    });

    return conferences;
  } catch (error) {
    console.error("Error fetching conferences:", error);
    return [];
  }
}

// --- WRITE ACTIONS ---

export async function createConference(data: any) {
  const user = await getUserContext();
  if (!user) return { success: false, message: "Unauthorized" };

  const hasGlobalWrite = user.permissions.includes("conference:write");
  const hasRegionalWrite = user.permissions.includes(
    "conference:write_regional",
  );

  if (!hasGlobalWrite && !hasRegionalWrite) {
    return { success: false, message: "Ingen tilgang." };
  }

  try {
    let regionId = null;

    if (hasGlobalWrite) {
      // Global Admin: Trust the ID passed from the dropdown
      // If data.regionId is empty string or null, it remains null (National)
      if (data.regionId) {
        regionId = data.regionId;
      }
    } else if (hasRegionalWrite) {
      // Regional Admin: Force their assigned ID (ignore form input)
      regionId = user.regionId;
    }

    await prisma.conference.create({
      data: {
        name: data.name,
        shortname: data.shortname,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        active: true,
        archived: false,
        regionId: regionId,
      },
    });

    revalidatePath("/hjem");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Feil ved opprettelse: " + error };
  }
}

export async function toggleArchiveConference(id: number, archive: boolean) {
  const user = await getUserContext();

  // NOTE: You might need to update this logic too if regional users
  // should be allowed to archive their OWN conferences.
  // For now, leaving it restricted to global write or delete permissions.
  if (!user?.permissions.includes("conference:write")) {
    return { success: false, message: "Ingen tilgang." };
  }

  try {
    await prisma.conference.update({
      where: { id },
      data: {
        archived: archive,
        active: !archive,
      },
    });
    revalidatePath("/hjem");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Feil ved arkivering." };
  }
}

export async function deleteConference(id: number) {
  const user = await getUserContext();
  if (!user?.permissions.includes("conference:delete")) {
    return { success: false, message: "Ingen tilgang." };
  }

  try {
    await prisma.conference.delete({ where: { id } });
    revalidatePath("/hjem");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: "Kan ikke slette konferanse med innhold.",
    };
  }
}
