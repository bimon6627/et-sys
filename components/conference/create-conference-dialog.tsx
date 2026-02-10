"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { BiPlus, BiRename, BiHash, BiMap, BiChevronDown } from "react-icons/bi";
import {
  createConference,
  getAllRegions,
} from "@/app/actions/conference-actions";

// 1. Define Props for the component
interface CreateConferenceDialogProps {
  permissions: string[];
  assignedRegionId: number | null;
}

interface ConferenceForm {
  name: string;
  shortname: string;
  regionId: number | null;
  startDate: string;
  endDate: string;
}

// 2. Remove 'async' and accept props
export default function CreateConferenceDialog({
  permissions,
  assignedRegionId,
}: CreateConferenceDialogProps) {
  // Note: We don't fetch auth() here. We use the props passed down.

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableRegions, setAvailableRegions] = useState<
    { id: number; name: string }[]
  >([]);

  const hasGlobalWrite = permissions.includes("conference:write");
  const hasRegionalWrite = permissions.includes("conference:write_regional");

  const [form, setForm] = useState<ConferenceForm>({
    name: "",
    shortname: "",
    regionId: null,
    startDate: "",
    endDate: "",
  });

  // Fetch regions on mount if the user is a Global Admin
  useEffect(() => {
    if (hasGlobalWrite) {
      const fetchRegions = async () => {
        const regions = await getAllRegions();
        setAvailableRegions(regions);
      };
      fetchRegions();
    }
  }, [hasGlobalWrite]);

  // Effect: Auto-set region for Regional Admins when dialog opens
  useEffect(() => {
    if (isOpen && !hasGlobalWrite && hasRegionalWrite && assignedRegionId) {
      setForm((prev) => ({ ...prev, regionId: assignedRegionId }));
    }
  }, [isOpen, hasGlobalWrite, hasRegionalWrite, assignedRegionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await createConference(form);

    setIsSubmitting(false);
    if (res.success) {
      setIsOpen(false);
      setForm({
        name: "",
        shortname: "",
        startDate: "",
        endDate: "",
        regionId: !hasGlobalWrite && hasRegionalWrite ? assignedRegionId : null,
      });
    } else {
      alert(res.message);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors text-sm font-semibold mx-auto mt-4"
      >
        <BiPlus className="size-5" /> Ny Konferanse
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
            <DialogTitle className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
              Opprett Nytt Arrangement
            </DialogTitle>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Navn
                </label>
                <div className="relative">
                  <BiRename className="absolute top-2.5 left-3 text-gray-400" />
                  <input
                    required
                    className="w-full border rounded-lg p-2 pl-10"
                    placeholder="Elevtinget 2026"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Shortname */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Kortnavn (Unik ID)
                </label>
                <div className="relative">
                  <BiHash className="absolute top-2.5 left-3 text-gray-400" />
                  <input
                    required
                    className="w-full border rounded-lg p-2 pl-10"
                    placeholder="et2026"
                    value={form.shortname}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        shortname: e.target.value
                          .toLowerCase()
                          .replace(/\s/g, ""),
                      })
                    }
                  />
                </div>
              </div>

              {/* Region Dropdown */}
              {hasGlobalWrite && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Region
                  </label>
                  <div className="relative">
                    <BiMap className="absolute top-2.5 left-3 text-gray-400 pointer-events-none" />
                    <select
                      className="w-full border rounded-lg p-2 pl-10 appearance-none bg-white text-gray-700"
                      value={form.regionId ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm({
                          ...form,
                          regionId: val === "" ? null : Number(val),
                        });
                      }}
                    >
                      <option value="">Nasjonalt (Ingen region)</option>
                      {availableRegions.map((region) => (
                        <option key={region.id} value={region.id}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                    <BiChevronDown className="absolute top-3 right-3 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Start
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full border rounded-lg p-2"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Slutt
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full border rounded-lg p-2"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Oppretter..." : "Opprett"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Avbryt
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
