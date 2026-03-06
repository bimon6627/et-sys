// app/hjem/[conferenceId]/admin/import/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BiArrowBack } from "react-icons/bi";
import ImportFormClient from "@/components/admin/import-form-client";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    conferenceId: string;
  }>;
}

export default async function AdminImportPage({ params }: PageProps) {
  const { conferenceId } = await params;
  const session = await auth();
  const permissions = session?.user?.permissions || [];

  if (!permissions.includes("users:write")) {
    redirect("/unauthorized");
  }

  // Fetch conference details (Server Side)
  const conference = await prisma.conference.findUnique({
    where: { shortname: conferenceId },
    select: { name: true, regionId: true },
  });

  if (!conference) {
    redirect("/404");
  }

  // Logic: Only show auto-sync if regionId is missing (null/undefined)
  const showAutoSync = !conference.regionId;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/hjem/${conferenceId}/deltakere`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <BiArrowBack />
          Tilbake til deltakerliste
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">
        Importer data til {conference.name}
      </h1>

      {/* Pass the calculated boolean down to the client */}
      <ImportFormClient
        conferenceId={conferenceId}
        showAutoSync={showAutoSync}
      />
    </div>
  );
}
