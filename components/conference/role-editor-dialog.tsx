"use client";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";
import { saveConferenceRole } from "@/app/actions/conference-role-actions";
import { useState, useEffect } from "react";

export default function RoleEditorDialog({
  isOpen,
  close,
  role,
  allPermissions,
  shortname,
}: any) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial data when opening for edit
  useEffect(() => {
    if (role) {
      setSelectedPermissions(role.permissions.map((p: any) => p.slug));
    } else {
      setSelectedPermissions([]);
    }
  }, [role, isOpen]);

  const togglePermission = (slug: string) => {
    if (selectedPermissions.includes(slug)) {
      setSelectedPermissions((prev) => prev.filter((p) => p !== slug));
    } else {
      setSelectedPermissions((prev) => [...prev, slug]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    // Append permissions manually since checkboxes are controlled
    // (Or use hidden inputs, but explicit appending is cleaner here)
    selectedPermissions.forEach((p) => formData.append("permissions", p));

    if (role) formData.append("id", role.id);

    const res = await saveConferenceRole(shortname, formData);

    setIsSubmitting(false);
    if (res.success) close();
    else alert("Noe gikk galt");
  };

  return (
    <Dialog open={isOpen} onClose={close} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl font-bold mb-4">
            {role ? "Rediger Rolle" : "Opprett Ny Rolle"}
          </DialogTitle>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Rollenavn
                </label>
                <input
                  name="name"
                  defaultValue={role?.name}
                  required
                  className="w-full border rounded p-2"
                  placeholder="F.eks. Ordstyrerbord"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Beskrivelse
                </label>
                <input
                  name="description"
                  defaultValue={role?.description}
                  className="w-full border rounded p-2"
                  placeholder="Kort beskrivelse..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Tilganger
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50 p-4 rounded-lg border">
                {allPermissions.map((p: any) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="rounded text-blue-600 focus:ring-blue-500"
                      checked={selectedPermissions.includes(p.slug)}
                      onChange={() => togglePermission(p.slug)}
                    />
                    <div>
                      <span className="block text-sm font-medium text-gray-900">
                        {p.slug}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {p.description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Lagrer..." : "Lagre Rolle"}
              </button>
              <button
                type="button"
                onClick={close}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Avbryt
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
