"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useState, useEffect } from "react";
import { updateWhitelistUser } from "@/app/actions/user-actions";
import { BiSave } from "react-icons/bi";

type UserListItem = {
  id: number;
  email: string;
  role: { id: number; name: string } | null;
  region: { id: number; name: string } | null;
};

type DropdownItem = { id: number; name: string };

interface UserEditDialogProps {
  open: boolean;
  onCloseAction: () => void;
  user: UserListItem;
  roles: DropdownItem[];
  regions: DropdownItem[];
}

export default function UserEditDialog({
  open,
  onCloseAction,
  user,
  roles,
  regions,
}: UserEditDialogProps) {
  const [selectedRole, setSelectedRole] = useState<number>(user.role?.id || 0);
  const [selectedRegion, setSelectedRegion] = useState<number | "">(
    user.region?.id || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when user changes
  useEffect(() => {
    setSelectedRole(user.role?.id || 0);
    setSelectedRegion(user.region?.id || "");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const regionId = selectedRegion === "" ? null : Number(selectedRegion);
      const result = await updateWhitelistUser(
        user.id,
        Number(selectedRole),
        regionId
      );

      if (result.success) {
        onCloseAction();
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("En feil oppsto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onCloseAction} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md space-y-4 border bg-white p-8 rounded-xl shadow-lg">
          <DialogTitle className="font-bold text-xl text-gray-900">
            Rediger Bruker
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Endre tilgang for {user.email}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            {/* Role Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rolle
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              >
                <option value="" disabled>
                  Velg rolle...
                </option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Region Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) =>
                  setSelectedRegion(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">Ingen region (System Admin)</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <button
                type="button"
                onClick={onCloseAction}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                <BiSave /> {isSubmitting ? "Lagrer..." : "Lagre"}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
