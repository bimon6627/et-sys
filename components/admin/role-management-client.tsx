"use client";

import { useState } from "react";
import { BiEdit, BiTrash, BiPlus } from "react-icons/bi";
import RoleDialog from "@/components/admin/role-dialog";
import { deleteRole } from "@/app/actions/role-actions";

export default function RoleManagementClient({ roles, allPermissions }: any) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const handleCreate = () => {
    setEditingRole(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (role: any) => {
    setEditingRole(role);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (
      confirm(
        "Er du sikker på at du vil slette denne rollen? Brukere med denne rollen vil miste tilgangen."
      )
    ) {
      try {
        await deleteRole(id);
      } catch (error) {
        alert("Kunne ikke slette rollen. (Du kan ikke slette ADMIN)");
      }
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 transition"
        >
          <BiPlus /> Ny Rolle
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rollenavn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rettigheter
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Handling
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role: any) => (
              <tr key={role.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {role.name}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((p: any) => (
                      <span
                        key={p.id}
                        className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 border border-blue-200"
                      >
                        {p.slug}
                      </span>
                    ))}
                    {role.permissions.length === 0 && (
                      <span className="text-gray-400 italic text-sm">
                        Ingen rettigheter
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleEdit(role)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <BiEdit className="size-5" />
                    </button>
                    {role.name !== "ADMIN" && (
                      <button
                        onClick={() => handleDelete(role.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <BiTrash className="size-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RoleDialog
        open={isDialogOpen}
        onCloseAction={() => setIsDialogOpen(false)}
        roleToEdit={editingRole}
        allPermissions={allPermissions}
      />
    </>
  );
}
