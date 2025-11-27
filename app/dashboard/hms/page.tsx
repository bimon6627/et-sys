import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAllHmsIncidents } from "@/app/actions/hms-actions";
import HmsIncidentDashboard from "@/components/hms/hms-incident-dashboard";

export default async function HmsDashboardPage() {
  const session = await auth();
  const permissions = session?.user?.permissions || [];

  if (!permissions.includes("hse:read")) {
    redirect("/unauthorized");
  }

  const canWrite = permissions.includes("hse:write");
  const canDelete = permissions.includes("hse:delete");
  const incidents = await getAllHmsIncidents();

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <HmsIncidentDashboard
        initialIncidents={incidents}
        canCreate={canWrite}
        canWrite={canWrite}
        canDelete={canDelete}
      />
    </div>
  );
}
