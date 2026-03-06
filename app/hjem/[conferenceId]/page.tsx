import { Metadata } from "next";
import HomeInfo from "@/components/home/home-info";
import { auth } from "@/auth";
import { cache } from "react"; // Import React cache
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma"; // Assuming you have a prisma instance export
import getDatamatrix from "@/components/ts/get-datamatrix";
import Image from "next/image";

// 1. CACHE THE WHOLE DATA FETCH
// This ensures auth() and user DB lookups run only once per request,
// shared between generateMetadata and the Page.
const getConferenceData = cache(async (conferenceId: string) => {
  if (!conferenceId) return null;

  const session = await auth();
  if (!session?.user?.email) return "UNAUTHORIZED";

  // 1. FETCH USER CONTEXT & LOCAL ROLE
  // We check if they have a pivot row for THIS conference (by shortname)
  const currentUser = await prisma.whitelist.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      regionId: true,
      conferenceOrganizer: {
        where: {
          conference: { shortname: conferenceId }, // 👈 The Magic Link
        },
        select: { id: true }, // We only need to know if a row exists
      },
    },
  });

  if (!currentUser) return "UNAUTHORIZED";

  // 2. FETCH CONFERENCE
  const conference = await prisma.conference.findUnique({
    where: { shortname: conferenceId },
    include: { region: { select: { name: true } } },
  });

  if (!conference) return null;

  // 3. THE HYBRID PERMISSION CHECK
  const permissions = session?.user?.permissions || [];

  // Layer 1: Global Admin
  const isGlobalAdmin = permissions.includes("conference:read");

  // Layer 2: Regional Admin (Must match region)
  const isRegionalAdmin =
    permissions.includes("conference:read_regional") &&
    currentUser.regionId === conference.regionId;

  // Layer 3: Context Organizer (The Fix for Temporary Users)
  const isLocalOrganizer = currentUser.conferenceOrganizer.length > 0;

  // FINAL DECISION: Access granted if ANY layer passes
  if (isGlobalAdmin || isRegionalAdmin || isLocalOrganizer) {
    return { conference };
  }

  return "UNAUTHORIZED";
});

// --- METADATA ---
export async function generateMetadata({
  params,
}: {
  params: Promise<{ conferenceId: string }>; // Fix: Match prop name to Page
}): Promise<Metadata> {
  const { conferenceId } = await params;
  const result = await getConferenceData(conferenceId);

  if (!result || result === "UNAUTHORIZED" || !result.conference) {
    return { title: "Konferanse" };
  }

  return {
    title: result.conference.name,
    description: `Detaljer for ${result.conference.name}`,
  };
}

// --- PAGE COMPONENT ---
export default async function ConferenceDashboardPage({
  params,
}: {
  params: Promise<{ conferenceId: string }>;
}) {
  const { conferenceId } = await params;

  // Data is fetched from cache (deduplicated)
  const result = await getConferenceData(conferenceId);

  if (result === "UNAUTHORIZED") redirect("/unauthorized");
  if (!result || !result.conference) notFound();

  const { conference } = result;

  return (
    <div className="bg-white min-w-screen min-h-screen md:flex flex-row">
      <main className="flex flex-row flex-grow items-center justify-center w-full h-full p-6 md:p-10">
        <div className="w-1/2 space-y-3 top-20">
          <h1 className="text-3xl md:text-5xl font-bold text-center">
            {conference.name}
          </h1>
          {conference.region ? (
            <>
              <h2 className="text-md md:text-xl text-center">
                {conference.region.name}
              </h2>
            </>
          ) : (
            <></>
          )}
          <HomeInfo
            conferenceId={conference.id}
            regionId={conference.regionId}
          />
        </div>
        <div>
          <Image
            src={getDatamatrix("ThisIsATest0123456789")}
            alt={"A datamatrix"}
            width={30}
            height={30}
          ></Image>
        </div>
      </main>
    </div>
  );
}
