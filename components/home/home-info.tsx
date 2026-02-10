import { prisma } from "@/lib/prisma";
import { BiBuilding, BiUserVoice } from "react-icons/bi";

// Define the props we expect from the parent
interface DashboardInfoProps {
  conferenceId: number;
  regionId: number | null; // regionId can be null (e.g., global events)
}

export default async function HomeInfo({
  conferenceId,
  regionId,
}: DashboardInfoProps) {
  // Safety check: If no region is linked, we might not want to fetch regional orgs
  // or we treat it as looking for orgs with regionId: null

  const [votingOrgs, totalOrgs, representedOrgs] = await Promise.all([
    // 1. Count Organizations in THIS region that can vote
    prisma.organization.count({
      where: {
        canVote: true,
        regionId: regionId ?? undefined, // Handle null explicitly if needed
      },
    }),

    // 2. Count Total Organizations in THIS region
    prisma.organization.count({
      where: {
        regionId: regionId ?? undefined,
      },
    }),

    // 3. Count Voting Orgs that have AT LEAST one participant in THIS conference
    prisma.organization.count({
      where: {
        canVote: true,
        regionId: regionId ?? undefined,
        participants: {
          some: {
            // CRITICAL: Ensure the participant belongs to THIS conference
            conferenceId: conferenceId,
          },
        },
      },
    }),
  ]);

  // Avoid division by zero
  const representationPercentage =
    votingOrgs > 0 ? Math.round((representedOrgs / votingOrgs) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Oversikt</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Total Voting Organizations */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase">
              Stemmeberettigede Org.
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {votingOrgs}{" "}
              <span className="text-lg text-gray-400 font-normal">
                / {totalOrgs}
              </span>
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full">
            <BiBuilding className="size-8 text-blue-600" />
          </div>
        </div>

        {/* Card 2: Represented Organizations (Delegates Present) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase">
              Representerte Org.
            </p>
            <span className="flex flex-row gap-2 items-end">
              <p className="text-3xl font-bold text-gray-900">
                {representedOrgs} / {votingOrgs}
              </p>{" "}
              <p className="text-xl text-gray-900 font-thin">
                ({representationPercentage}%)
              </p>
            </span>
          </div>
          <div className="p-3 bg-green-50 rounded-full">
            <BiUserVoice className="size-8 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
