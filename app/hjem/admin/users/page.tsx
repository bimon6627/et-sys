import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

// ⚠️ Ensure your UserForm and UserManagementClient imports are correct
import UserForm from "@/components/admin/user-form";
import UserManagementClient from "@/components/admin/user-management-client";

async function getAdminData() {
  // Fetch all available Roles and Regions for the dropdowns
  const roles = await prisma.role.findMany({
    select: { id: true, name: true, description: true },
    orderBy: { name: "asc" },
  });

  const regions = await prisma.region.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // ✅ NEW: Fetch all Whitelist users including their Role and Region
  const users = await prisma.whitelist.findMany({
    include: {
      role: { select: { id: true, name: true } },
      region: { select: { id: true, name: true } },
    },
    orderBy: { email: "asc" },
  });

  return { roles, regions, users };
}

export default async function AdminUsersPage() {
  const session = await auth();
  const permissions = session?.user?.permissions || [];

  // Security Check (Using the working in-page check)
  if (!permissions.includes("users:read")) {
    redirect("/unauthorized");
  }

  const { roles, regions, users } = await getAdminData();

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Brukerstyring</h1>

      <section className="mb-8 p-6 bg-gray-50 rounded-lg shadow-md border">
        <h2 className="text-xl font-semibold mb-4">Legg til ny bruker</h2>

        {/* UserForm allows creation */}
        <UserForm roles={roles} regions={regions} />
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Eksisterende brukere</h2>

        {/* ✅ Pass ALL data to the new management component */}
        <UserManagementClient
          initialUsers={users}
          allRoles={roles}
          allRegions={regions}
        />
      </section>
    </>
  );
}
