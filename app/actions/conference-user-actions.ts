"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth"; // Your auth helper
import { revalidatePath } from "next/cache";

// --- FETCHERS ---

export async function getConferenceStaff(shortname: string) {
  const conference = await prisma.conference.findUnique({
    where: { shortname },
    include: {
      conferenceOrganizers: {
        include: {
          user: true, // Get name/email
          role: true, // Get role name
        },
      },
    },
  });
  return conference?.conferenceOrganizers || [];
}

export async function getAvailableRoles(conferenceShortname: string) {
  const conference = await prisma.conference.findUnique({
    where: { shortname: conferenceShortname },
  });

  if (!conference) return [];

  // Fetch "Global Templates" (null) AND "Custom Roles" (this ID)
  return await prisma.conferenceRole.findMany({
    where: {
      OR: [{ conferenceId: null }, { conferenceId: conference.id }],
    },
    orderBy: { name: "asc" },
  });
}

// --- MUTATIONS ---

export async function addStaffMember(
  shortname: string,
  data: {
    email: string;
    roleId: number;
    name?: string; // Optional: Only needed if creating new
    mode: "search" | "create";
  },
) {
  // 1. Security Check (Simplified for brevity - use your hybrid check here)
  const session = await auth();
  if (!session) return { success: false, message: "Unauthorized" };

  // 2. Resolve Conference
  const conference = await prisma.conference.findUnique({
    where: { shortname },
  });
  if (!conference) return { success: false, message: "Conference not found" };

  let userId: number;

  try {
    if (data.mode === "search") {
      // MODE A: EXISTING USER
      const existingUser = await prisma.whitelist.findUnique({
        where: { email: data.email },
      });
      if (!existingUser)
        return {
          success: false,
          message: "Fant ingen bruker med den e-posten.",
        };
      userId = existingUser.id;
    } else {
      // MODE B: NEW USER (Temporary / External)
      // Check if they accidentally exist already
      const existing = await prisma.whitelist.findUnique({
        where: { email: data.email },
      });

      if (existing) {
        // Fallback: If they exist, just use them
        userId = existing.id;
      } else {
        // Create the new "empty" user (No global role, No region)
        // You might want to trigger a "Send Invitation Email" logic here
        const newUser = await prisma.whitelist.create({
          data: {
            email: data.email,
            // Assuming Whitelist has a 'name' field, or you handle profile elsewhere
            // name: data.name
          },
        });
        userId = newUser.id;
      }
    }

    // 3. Create the Link (Pivot Table)
    await prisma.conferenceOrganizer.create({
      data: {
        userId: userId,
        conferenceId: conference.id,
        roleId: data.roleId,
      },
    });

    revalidatePath(`/hjem/${shortname}/innstillinger/brukere`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: "Brukeren har allerede en rolle i denne konferansen.",
    };
  }
}

export async function removeStaffMember(
  organizerId: number,
  shortname: string,
) {
  // Security check here...
  try {
    await prisma.conferenceOrganizer.delete({ where: { id: organizerId } });
    revalidatePath(`/hjem/${shortname}/innstillinger/brukere`);
    return { success: true };
  } catch (error) {
    return { success: false, message: "Kunne ikke slette bruker." };
  }
}
