"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
// We don't strictly need the helper here since we are doing a fresh DB fetch for security
// import getUserPermissions from "@/components/ts/get-user-permissions";

export type ParticipantWithRelations = Awaited<
  ReturnType<typeof getParticipantsGroupedByRegion>
>[number];

// 💡 UPDATE: Accept the shortname so we can check conference-specific rights
async function checkParticipantReadAuth(conferenceShortName: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  // 1. Fetch User + Global Role + Specific Conference Role
  const user = await prisma.whitelist.findUnique({
    where: { email: session.user.email },
    include: {
      // Global Role
      role: { include: { permissions: true } },
      // Conference Specific Role (Filter by the shortname we are accessing)
      conferenceOrganizer: {
        where: {
          conference: { shortname: conferenceShortName },
        },
        include: { role: { include: { permissions: true } } },
      },
      region: true,
    },
  });

  if (!user) throw new Error("User not found");

  // 2. Merge Permissions (Global + Conference)
  const globalPermissions = user.role?.permissions.map((p) => p.slug) || [];

  // Since we filtered in the query, this array will have 0 or 1 items
  const conferencePermissions =
    user.conferenceOrganizer[0]?.role?.permissions.map((p) => p.slug) || [];

  // Combine them into one list
  const allPermissions = [
    ...new Set([...globalPermissions, ...conferencePermissions]),
  ];

  // 3. Security Check
  if (
    !allPermissions.includes("participant:read") &&
    !allPermissions.includes("participant:regional_read")
  ) {
    throw new Error("Unauthorized");
  }

  // Return the user with the COMBINED permissions
  return { ...user, permissions: allPermissions };
}

export async function getParticipantsGroupedByRegion(
  conferenceShortName: string,
) {
  // 💡 UPDATE: Pass the shortname to the auth check
  const user = await checkParticipantReadAuth(conferenceShortName);

  try {
    const conference = await prisma.conference.findUnique({
      where: { shortname: conferenceShortName },
      select: { id: true },
    });

    if (!conference) {
      console.error(`Conference '${conferenceShortName}' not found.`);
      return {};
    }

    let whereClause: any = {
      conferenceId: conference.id,
    };

    // 4. Use the combined permissions we calculated above
    const hasGlobalRead = user.permissions.includes("participant:read");
    const hasRegionalRead = user.permissions.includes(
      "participant:regional_read",
    );

    // Apply Region Restriction
    // Logic: If I don't have full read, but I have regional read...
    if (!hasGlobalRead && hasRegionalRead) {
      if (user.regionId) {
        whereClause.regionId = user.regionId;
      } else {
        return {};
      }
    }

    const participants = await prisma.participant.findMany({
      where: whereClause,
      include: { region: true, organization: true },
      orderBy: { organization: { name: "asc" } },
    });

    // 4. Grouping Logic (Standardized)
    const grouped: Record<
      string,
      Record<
        string,
        {
          organization: any;
          delegates: any[];
          observers: any[];
        }
      >
    > = {};

    for (const p of participants) {
      const regionName = p.region.name;
      const orgName = p.organization.name;

      if (!grouped[regionName]) {
        grouped[regionName] = {};
      }

      if (!grouped[regionName][orgName]) {
        grouped[regionName][orgName] = {
          organization: p.organization,
          delegates: [],
          observers: [],
        };
      }

      if (p.type === "DELEGATE") {
        grouped[regionName][orgName].delegates.push(p);
      } else {
        grouped[regionName][orgName].observers.push(p);
      }
    }

    return grouped;
  } catch (error) {
    console.error("Error fetching grouped participants:", error);
    return {};
  }
}
