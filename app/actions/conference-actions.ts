"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// --- SECURITY HELPERS ---

async function getUserContext() {
  const session = await auth();
  if (!session?.user?.email) return null;

  // Fetch full user details to get regionId
  const user = await prisma.whitelist.findUnique({
    where: { email: session.user.email },
    include: { role: { include: { permissions: true } } },
  });

  if (!user) return null;

  // Flatten permissions
  const permissions = user.role?.permissions.map((p) => p.slug) || [];

  return {
    id: user.id,
    regionId: user.regionId,
    permissions,
  };
}

// --- FETCH ACTIONS ---

export async function getAvailableConferences() {
  const user = await getUserContext();
  if (!user) return [];

  const canReadAll = user.permissions.includes("conference:read");
  const canReadRegional = user.permissions.includes("conference:read_regional");

  if (!canReadAll && !canReadRegional) return [];

  try {
    const whereClause: any = {};

    // 💡 Filter Logic
    if (canReadAll) {
      // Admins see everything (no filter on region)
    } else if (canReadRegional) {
      // Regional users see: Their region OR Global conferences (regionId is null)
      whereClause.OR = [{ regionId: user.regionId }, { regionId: null }];
      // Hide archived conferences for normal users? (Optional, usually good UX)
      // whereClause.archived = false;
    }

    const conferences = await prisma.conference.findMany({
      where: whereClause,
      include: {
        region: { select: { name: true } },
        _count: { select: { participants: true } }, // Show stats
      },
      orderBy: [
        { active: "desc" }, // Active first
        { startDate: "desc" }, // Then newest
      ],
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
  if (!user?.permissions.includes("conference:write")) {
    throw new Error("Unauthorized");
  }

  try {
    // Note: You might want to let admins select a region for the conference here
    await prisma.conference.create({
      data: {
        name: data.name,
        shortname: data.shortname,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        active: true,
        archived: false,
        // regionId: data.regionId // If you add this to the form later
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Kunne ikke opprette konferanse." };
  }
}

export async function toggleArchiveConference(id: number, archive: boolean) {
  const user = await getUserContext();
  if (!user?.permissions.includes("conference:write")) {
    return { success: false, message: "Ingen tilgang." };
  }

  try {
    await prisma.conference.update({
      where: { id },
      data: {
        archived: archive,
        active: !archive, // Usually if archived, it's not active
      },
    });
    revalidatePath("/dashboard");
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
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: "Kan ikke slette konferanse med innhold.",
    };
  }
}
