import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getParticipantsGroupedByRegion } from "@/app/actions/participant-actions";
import ParticipantsDashboard from "@/components/participants/participants-dashboard";
import { Metadata } from "next";
import getUserPermissions from "@/components/ts/get-user-permissions";

export const metadata: Metadata = {
  title: "Deltakere",
};

interface PageProps {
  params: Promise<{ conferenceId: string }>;
}

export default async function ParticipantsPage({ params }: PageProps) {
  // 1. Await params to access the dynamic route slug
  const { conferenceId } = await params;

  const session = await auth();
  const permissions = getUserPermissions(conferenceId, session?.user);

  // Security Check: Require READ permission
  if (
    !(
      permissions.includes("participant:read") ||
      permissions.includes("participant:regional_read")
    )
  ) {
    redirect("/unauthorized");
  }

  // 2. Pass the conferenceId to the data fetcher
  const groupedParticipants =
    await getParticipantsGroupedByRegion(conferenceId);

  // Determine write permissions for the client component
  const canWrite = permissions.includes("participant:write");

  return (
    <div className="flex md:flex-row flex-col">
      <div className="max-w-7xl mx-auto w-full">
        <ParticipantsDashboard
          conferenceId={conferenceId} // 3. Pass it down to the client component
          groupedData={groupedParticipants}
          canWrite={canWrite}
        />
      </div>
    </div>
  );
}
