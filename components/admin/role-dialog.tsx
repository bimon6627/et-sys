"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useState, useEffect } from "react";
import { saveRole } from "@/app/actions/role-actions"; // Import the action

// Types matching your Prisma models
type Permission = { id: number; slug: string; description: string | null };
type RoleWithPermissions = {
  id?: number;
  name: string;
  permissions: Permission[];
};

interface RoleDialogProps {
  open: boolean;
  onCloseAction: () => void;
  roleToEdit?: RoleWithPermissions | null; // If null, we are creating
  allPermissions: Permission[];
}

export default function RoleDialog({
  open,
  onCloseAction,
  roleToEdit,
  allPermissions,
}: RoleDialogProps) {
  const [name, setName] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data when opening for Edit
  useEffect(() => {
    if (roleToEdit) {
      setName(roleToEdit.name);
      setSelectedPerms(roleToEdit.permissions.map((p) => p.slug));
    } else {
      // Reset for Create mode
      setName("");
      setSelectedPerms([]);
    }
  }, [roleToEdit, open]);

  const handleCheckbox = (slug: string) => {
    if (selectedPerms.includes(slug)) {
      setSelectedPerms(selectedPerms.filter((s) => s !== slug));
    } else {
      setSelectedPerms([...selectedPerms, slug]);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await saveRole(formData);
      onCloseAction();
    } catch (e) {
      alert("Failed to save role");
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onCloseAction} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="max-w-lg w-full space-y-4 border bg-white p-8 rounded-xl shadow-lg">
          <DialogTitle className="font-bold text-xl">
            {roleToEdit ? "Rediger Rolle" : "Ny Rolle"}
          </DialogTitle>

          <form action={handleSubmit} className="flex flex-col gap-4">
            {/* Hidden ID field for Updates */}
            {roleToEdit?.id && (
              <input type="hidden" name="id" value={roleToEdit.id} />
            )}

            {/* Role Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Rollenavn
              </label>
              <input
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="E.g. OBSERVATOR_LEDER"
                required
              />
            </div>

            {/* Permissions List */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Rettigheter
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border p-2 rounded bg-gray-50">
                {allPermissions.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      name="permissions"
                      value={perm.slug}
                      checked={selectedPerms.includes(perm.slug)}
                      onChange={() => handleCheckbox(perm.slug)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{perm.slug}</span>
                      <span className="text-xs text-gray-500">
                        {perm.description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={onCloseAction}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? "Lagrer..." : "Lagre"}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
