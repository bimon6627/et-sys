"use client";

import { useState } from "react";
import { BiTrash, BiUserCircle, BiBadgeCheck } from "react-icons/bi";
import { removeStaffMember } from "@/app/actions/conference-user-actions";
import AddStaffDialog from "./add-staff-dialog";

export default function StaffListClient({ initialStaff, shortname }: any) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <span className="font-semibold text-gray-700">
            Arrangører ({initialStaff.length})
          </span>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
          >
            + Legg til
          </button>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">Navn</th>
              <th className="p-4 font-medium text-gray-500">E-post</th>
              <th className="p-4 font-medium text-gray-500">Rolle</th>
              <th className="p-4 font-medium text-gray-500 text-right">
                Handling
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {initialStaff.map((organizer: any) => (
              <tr
                key={organizer.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                    <BiUserCircle size={20} />
                  </div>
                  <span className="font-medium text-gray-900">
                    {/* Whitelist doesn't strictly have name in your schema, but assuming it does or you fetch profile */}
                    {organizer.user.email.split("@")[0]}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{organizer.user.email}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold border border-blue-100">
                    <BiBadgeCheck />
                    {organizer.role.name}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={async () => {
                      if (
                        confirm(
                          "Er du sikker på at du vil fjerne denne brukeren?",
                        )
                      ) {
                        await removeStaffMember(organizer.id, shortname);
                      }
                    }}
                    className="text-gray-400 hover:text-red-600 p-2 transition-colors"
                  >
                    <BiTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {initialStaff.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  Ingen brukere er lagt til enda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddStaffDialog
        isOpen={isDialogOpen}
        close={() => setIsDialogOpen(false)}
        shortname={shortname}
      />
    </>
  );
}
