"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import { BiUserPlus, BiSearch, BiUser, BiInfoCircle } from "react-icons/bi";
import {
  addStaffMember,
  getAvailableRoles,
} from "@/app/actions/conference-user-actions";

export default function AddStaffDialog({
  isOpen,
  close,
  shortname,
}: {
  isOpen: boolean;
  close: () => void;
  shortname: string;
}) {
  const [availableRoles, setAvailableRoles] = useState<
    { id: number; name: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [name, setName] = useState(""); // Only for create mode
  const [roleId, setRoleId] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState(0); // 0 = Search, 1 = Create

  // Fetch roles when dialog opens
  useEffect(() => {
    if (isOpen) {
      getAvailableRoles(shortname).then(setAvailableRoles);
    }
  }, [isOpen, shortname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await addStaffMember(shortname, {
      email,
      name,
      roleId: Number(roleId),
      mode: selectedTab === 0 ? "search" : "create",
    });

    setIsSubmitting(false);
    if (res.success) {
      close();
      setEmail("");
      setName("");
      setRoleId("");
    } else {
      alert(res.message);
    }
  };

  return (
    <Dialog open={isOpen} onClose={close} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
          <DialogTitle className="text-xl font-bold mb-4 flex items-center gap-2">
            <BiUserPlus className="text-blue-600" /> Legg til Arrangør
          </DialogTitle>

          <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
            <TabList className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-4">
              <Tab
                className={({ selected }) =>
                  `flex-1 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none
                  ${selected ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`
                }
              >
                Eksisterende Bruker
              </Tab>
              <Tab
                className={({ selected }) =>
                  `flex-1 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none
                  ${selected ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`
                }
              >
                Ny Midlertidig Bruker
              </Tab>
            </TabList>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TabPanels>
                {/* PANEL 1: SEARCH */}
                <TabPanel>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      E-postadresse
                    </label>
                    <div className="relative">
                      <BiSearch className="absolute top-3 left-3 text-gray-400" />
                      <input
                        type="email"
                        required
                        className="w-full pl-10 p-2 border rounded-lg"
                        placeholder="sok@eksempel.no"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Søker etter brukere som allerede finnes i systemet.
                    </p>
                  </div>
                </TabPanel>

                {/* PANEL 2: CREATE */}
                <TabPanel className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Navn
                    </label>
                    <div className="relative">
                      <BiUser className="absolute top-3 left-3 text-gray-400" />
                      <input
                        type="text"
                        required
                        className="w-full pl-10 p-2 border rounded-lg"
                        placeholder="Ola Nordmann"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      E-postadresse
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full p-2 border rounded-lg"
                      placeholder="ny@bruker.no"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-row items-center gap-2 bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800 border border-yellow-200">
                    <BiInfoCircle />
                    <span>
                      Denne brukeren vil kun ha tilgang til denne konferansen.
                    </span>
                  </div>
                </TabPanel>
              </TabPanels>

              {/* SHARED: ROLE SELECTOR */}
              <div className="pt-2 border-t">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Tildel Rolle
                </label>
                <select
                  required
                  className="w-full p-2 border rounded-lg bg-white"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                >
                  <option value="">Velg en rolle...</option>
                  {availableRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Lagrer..." : "Legg til"}
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Avbryt
                </button>
              </div>
            </form>
          </TabGroup>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
