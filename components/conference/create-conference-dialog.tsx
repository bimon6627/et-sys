"use client";

import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { BiPlus, BiCalendar, BiRename, BiHash } from "react-icons/bi";
import { createConference } from "@/app/actions/conference-actions";

export default function CreateConferenceDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    shortname: "",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await createConference(form);

    setIsSubmitting(false);
    if (res.success) {
      setIsOpen(false);
      setForm({ name: "", shortname: "", startDate: "", endDate: "" });
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
