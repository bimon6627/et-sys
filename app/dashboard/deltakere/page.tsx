import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getParticipantsGroupedByRegion } from "@/app/actions/participant-actions";
import ParticipantsDashboard from "@/components/participants/participants-dashboard";
import NavbarAuthorized from "@/components/authorized/authorized-navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deltakere",
};

export default async function ParticipantsPage() {
  const session = await auth();
  const permissions = session?.user?.permissions || [];

  // Security Check: Require READ permission
  if (
    !(
      permissions.includes("participant:read") ||
      permissions.includes("participant:regional_read")
    )
  ) {
    redirect("/unauthorized");
  }

  // Fetch all data structured by region
  const groupedParticipants = await getParticipantsGroupedByRegion();

  // Determine write permissions for the client component
  const canWrite = permissions.includes("participant:write");

  return (
    <div className="flex md:flex-row">
      <NavbarAuthorized />
      <div className="p-8 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6">Deltakeroversikt</h1>
        <ParticipantsDashboard
          groupedData={groupedParticipants}
          canWrite={canWrite}
        />
      </div>
    </div>
  );
}
