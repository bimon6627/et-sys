"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Define a type for the structure we want to return
export type ParticipantWithRelations = Awaited<
  ReturnType<typeof getParticipantsGroupedByRegion>
>[number];

// 💡 Security Check: Users must have at least read permission
async function checkParticipantReadAuth() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.whitelist.findUnique({
    where: { email: session.user.email },
    include: {
      role: { include: { permissions: true } },
      region: true,
    },
  });

  if (!user) throw new Error("User not found");

  const permissions = user.role?.permissions.map((p) => p.slug) || [];

  if (
    !permissions.includes("participant:read") &&
    !permissions.includes("participant:regional_read")
  ) {
    throw new Error("Unauthorized");
  }

  return { ...user, permissions };
}

export async function getParticipantsGroupedByRegion() {
  const user = await checkParticipantReadAuth();

  try {
    let whereClause = {};

    const hasGlobalRead = user.permissions.includes("participant:read");
    const hasRegionalRead = user.permissions.includes(
      "participant:regional_read"
    );

    if (!hasGlobalRead && hasRegionalRead) {
      if (user.regionId) {
        whereClause = { regionId: user.regionId };
      } else {
        return {};
      }
    }

    // 2. Run ONE Query (Variable is now available to the rest of the function)
    const participants = await prisma.participant.findMany({
      where: whereClause,
      include: { region: true, organization: true },
      orderBy: { organization: { name: "asc" } },
    });

    // 3. Grouping Logic (Unchanged)
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
