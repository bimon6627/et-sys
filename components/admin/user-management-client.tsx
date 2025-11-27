"use client";

import { useState } from "react";
import { BiEdit, BiUserX } from "react-icons/bi";
// ⚠️ Note: You'll need to implement deleteWhitelistUser in user-actions.ts

// Since UserManagementClient might be used on its own, define simple types
type UserListItem = {
  id: number;
  email: string;
  role: { id: number; name: string } | null;
  region: { id: number; name: string } | null;
};

interface UserManagementClientProps {
  initialUsers: UserListItem[];
  allRoles: { id: number; name: string }[];
  allRegions: { id: number; name: string }[];
}

export default function UserManagementClient({
  initialUsers,
}: //allRoles,
//allRegions,
UserManagementClientProps) {
  const [users, setUsers] = useState(initialUsers);

  // State for Dialog/Modal when editing a user
  //const [isDialogOpen, setIsDialogOpen] = useState(false);
  //const [editingUser, setEditingUser] = useState<UserListItem | null>(null);

  const handleEdit = (user: UserListItem) => {
    // You would typically open a modal here to edit role/region
    //setEditingUser(user);
    //setIsDialogOpen(true);
    console.log(user);
    return;
  };

  const handleDelete = async (id: number, email: string) => {
    if (
      !confirm(
        `Er du sikker på at du vil fjerne brukeren ${email} fra whitelist? De vil miste tilgangen umiddelbart.`
      )
    ) {
      return;
    }

    try {
      // Call Server Action to delete user
      // await deleteWhitelistUser(id);

      // OPTIONAL: Since we don't have the real delete, we'll simulate for now
      setUsers(users.filter((u) => u.id !== id));
    } catch (error) {
      alert("Feil ved sletting av bruker.");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              E-post
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rolle
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Region
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Handling
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role?.name === "ADMIN"
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.role?.name || "Ingen Rolle"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.region?.name || "Ikke tildelt"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Rediger Rolle/Region"
                  >
                    <BiEdit className="size-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id, user.email)}
                    className="text-red-600 hover:text-red-900"
                    title="Fjern fra Whitelist"
                  >
                    <BiUserX className="size-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          Ingen brukere funnet.
        </div>
      )}

      {/* Optional: Add a modal here (similar to RoleDialog) for editing */}
      {/* You would use the UserForm logic for updating the user's role/region */}
    </div>
  );
}
