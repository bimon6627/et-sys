import NavbarAuthorized from "@/components/authorized/authorized-navbar";
import { Metadata } from "next";
import { auth } from "@/auth";
import { requireAuth } from "@/lib/auth-guard";
import { getAvailableConferences } from "@/app/actions/conference-actions";
import ConferenceCard from "@/components/conference/conference-card";
import CreateConferenceDialog from "@/components/conference/create-conference-dialog";
import { BiPlus } from "react-icons/bi";

export const metadata: Metadata = {
  title: "Arrangementer",
};

export default async function DashboardPage() {
  const session = await requireAuth();
  const permissions = session?.user?.permissions || [];

  const conferences = await getAvailableConferences();

  const canWrite = permissions.includes("conference:write");
  const canDelete = permissions.includes("conference:delete");

  return (
    <div className="bg-gray-50 min-h-screen flex md:flex-row">
      <NavbarAuthorized />

      <main className="flex-grow p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Arrangementer</h1>
            <p className="text-gray-500">
              Velg et arrangement for å administrere deltakere og saker.
            </p>
          </div>

          {canWrite && <CreateConferenceDialog />}
        </div>

        {/* Conference Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conferences.map((conf) => (
            <ConferenceCard
              key={conf.id}
              conference={conf}
              permissions={{ canWrite, canDelete }}
            />
          ))}

          {/* Empty State */}
          {conferences.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed text-gray-500">
              <p>Ingen arrangementer funnet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
