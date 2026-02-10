// app/hjem/admin/import/page.tsx (Original file)

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BiShield } from "react-icons/bi";
import ImportFormClient from "@/components/admin/import-form-client"; // 👈 NEW IMPORT

// DELETE the local ImportForm component definition

export default async function AdminImportPage() {
  const session = await auth();
  const permissions = session?.user?.permissions || [];

  // Security Check: Require a strong permission for data import
  if (!permissions.includes("users:write")) {
    redirect("/unauthorized");
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Importer Deltakerdata (Legacy System)
      </h1>

      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg shadow-md mb-8 flex items-center gap-3">
        <BiShield className="size-6 text-yellow-700" />
        <p className="text-sm text-yellow-800">
          Denne funksjonen krever tillatelse: <code>users:write</code>. Vær
          sikker på at filen er korrekt strukturert før du laster den opp.
        </p>
      </div>
      <ImportFormClient />
    </div>
  );
}
