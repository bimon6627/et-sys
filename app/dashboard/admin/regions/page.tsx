import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import OrgRegionManager from "@/components/admin/org-region-manager";

export default async function RegionsPage() {
  const session = await auth();
  const permissions = session?.user?.permissions || [];

  if (!permissions.includes("admin:view")) {
    redirect("/unauthorized");
  }

  // Fetch Data
  const regions = await prisma.region.findMany({ orderBy: { name: "asc" } });
  const organizations = await prisma.organization.findMany({
    include: { region: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Regioner og Organisasjoner</h1>
      <p className="text-gray-600 mb-8">
        Her kan du administrere strukturen i systemet. Vær varsom med sletting,
        da dette kan påvirke eksisterende deltakere.
      </p>

      <OrgRegionManager regions={regions} organizations={organizations} />
    </div>
  );
}
