"use client";

import { useState } from "react";
import { BiTrash, BiEdit, BiShieldQuarter, BiLock } from "react-icons/bi";
import { deleteConferenceRole } from "@/app/actions/conference-role-actions";
import RoleEditorDialog from "./role-editor-dialog";

export default function RoleListClient({
  roles,
  allPermissions,
  shortname,
}: any) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  const customRoles = roles.filter((r: any) => r.conferenceId !== null);
  const templateRoles = roles.filter((r: any) => r.conferenceId === null);

  const handleDelete = async (id: number) => {
    if (confirm("Er du sikker? Dette kan ikke angres.")) {
      const res = await deleteConferenceRole(shortname, id);
      if (res?.success === false) alert("Feil ved sletting");
    }
  };

  const openEditor = (role?: any) => {
    setEditingRole(role || null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: CUSTOM ROLES */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-blue-50">
          <h3 className="font-bold text-blue-900 flex items-center gap-2">
            <BiShieldQuarter /> Egendefinerte Roller
          </h3>
          <button
            onClick={() => openEditor()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
          >
            + Ny Rolle
          </button>
        </div>

        <div className="divide-y">
          {customRoles.length === 0 && (
            <div className="p-8 text-center text-gray-500 italic">
              Ingen egendefinerte roller enda.
            </div>
          )}
          {customRoles.map((role: any) => (
            <div
              key={role.id}
              className="p-4 hover:bg-gray-50 flex justify-between items-start"
            >
              <div>
                <h4 className="font-bold text-gray-900">{role.name}</h4>
                <p className="text-sm text-gray-500 mb-2">
                  {role.description || "Ingen beskrivelse"}
                </p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((p: any) => (
                    <span
                      key={p.id}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border"
                    >
                      {p.slug}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditor(role)}
                  className="p-2 text-gray-400 hover:text-blue-600"
                >
                  <BiEdit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(role.id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                  disabled={role._count.organizers > 0}
                  title={
                    role._count.organizers > 0
                      ? "Kan ikke slettes (i bruk)"
                      : "Slett"
                  }
                >
                  <BiTrash size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: TEMPLATE ROLES */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden opacity-75">
        <div className="p-4 border-b bg-gray-100 flex items-center gap-2">
          <BiLock className="text-gray-500" />
          <h3 className="font-bold text-gray-700">Globale Standardroller</h3>
        </div>
        <div className="divide-y bg-gray-50">
          {templateRoles.map((role: any) => (
            <div key={role.id} className="p-4">
              <div className="flex justify-between">
                <h4 className="font-bold text-gray-800">
                  {role.name}{" "}
                  <span className="text-xs font-normal text-gray-500 ml-2">
                    (Standard)
                  </span>
                </h4>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {role.permissions.map((p: any) => (
                  <span
                    key={p.id}
                    className="text-xs bg-white text-gray-500 px-2 py-0.5 rounded border"
                  >
                    {p.slug}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <RoleEditorDialog
        isOpen={isDialogOpen}
        close={() => setIsDialogOpen(false)}
        role={editingRole}
        allPermissions={allPermissions}
        shortname={shortname}
      />
    </div>
  );
}
