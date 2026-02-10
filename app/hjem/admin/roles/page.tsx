import { prisma } from "@/lib/prisma";
import { Protect } from "@/components/protect"; // Your protect component
import RoleManagementClient from "../../../../components/admin/role-management-client"; // We need a client wrapper for the interactive parts

export default async function AdminRolesPage() {
  // Fetch data on the server
  const roles = await prisma.role.findMany({
    include: { permissions: true },
    orderBy: { name: "asc" },
  });

  const allPermissions = await prisma.permission.findMany({
    orderBy: { slug: "asc" },
  });

  return (
    <Protect permission="admin:view">
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Rollestyring</h1>
        {/* Pass data to the Client Component */}
        <RoleManagementClient roles={roles} allPermissions={allPermissions} />
      </div>
    </Protect>
  );
}
