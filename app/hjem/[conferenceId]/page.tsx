import NavbarAuthorized from "@/components/authorized/authorized-navbar";
import { Metadata } from "next";
import HomeInfo from "@/components/home/home-info";
import { auth } from "@/auth";
import { cache } from "react"; // Import React cache
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma"; // Assuming you have a prisma instance export

// 1. CACHE THE WHOLE DATA FETCH
// This ensures auth() and user DB lookups run only once per request,
// shared between generateMetadata and the Page.
const getConferenceData = cache(async (conferenceId: string) => {
  if (!conferenceId) return null;

  const session = await auth();
  if (!session?.user?.email) return "UNAUTHORIZED";

  // Fetch Current User Permissions
  const currentUser = await prisma.whitelist.findUnique({
    where: { email: session.user.email },
    select: { regionId: true },
  });

  const permissions = session?.user?.permissions || [];
  const hasGlobalRead = permissions.includes("conference:read");
  const hasRegionalRead = permissions.includes("conference:read_regional");

  if (!hasGlobalRead && !hasRegionalRead) {
    return "UNAUTHORIZED";
  }

  // 2. FETCH CONFERENCE (Fix: Use prisma.conference, not organization)
  const conference = await prisma.conference.findUnique({
    where: { shortname: conferenceId },
    include: { region: { select: { name: true } } },
  });

  if (!conference) return null;

  // 3. REGIONAL SECURITY CHECK
  if (!hasGlobalRead) {
    // If user region doesn't match conference region -> Deny
    // Handle case where conference.regionId might be null (Global conf)
    if (
      !currentUser?.regionId ||
      (conference.regionId && currentUser.regionId !== conference.regionId)
    ) {
      return "UNAUTHORIZED";
    }
  }

  return { conference };
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
      <NavbarAuthorized />
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
      </main>
    </div>
  );
}
