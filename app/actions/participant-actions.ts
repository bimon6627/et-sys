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
  const permissions = session?.user?.permissions || [];

  // Checking for base read permission
  if (!permissions.includes("participant:read")) {
    throw new Error("Unauthorized: Missing 'participant:read' permission.");
  }
}

export async function getParticipantsGroupedByRegion() {
  await checkParticipantReadAuth();

  try {
    // Fetch all participants with their Region and Organization details
    const participants = await prisma.participant.findMany({
      include: { region: true, organization: true },
      orderBy: { organization: { name: "asc" } },
    });

    // Initialize grouping structure
    // Region -> Organization -> { delegates: [], observers: [] }
    const grouped: Record<
      string,
      Record<
        string,
        {
          organization: any;
          delegates: any[]; // 💡 CHANGED from single object to array
          observers: any[]; // 💡 CHANGED from single object to array
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
          delegates: [], // Initialize empty array
          observers: [], // Initialize empty array
        };
      }

      // Push to the correct array based on type
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
