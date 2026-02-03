"use client";

import { useState } from "react";
import {
  BiBuilding,
  BiMap,
  BiTrash,
  BiPlus,
  BiCheck,
  BiX,
  BiSearch, // Added search icon
} from "react-icons/bi";
import {
  createRegion,
  deleteRegion,
  createOrganization,
  deleteOrganization,
} from "@/app/actions/org-actions";

type Region = { id: number; name: string; internal: boolean };
type Organization = {
  id: number;
  name: string;
  canVote: boolean;
  regionId: number;
  region: { name: string };
};

interface ManagerProps {
  regions: Region[];
  organizations: Organization[];
}

export default function OrgRegionManager({
  regions,
  organizations,
}: ManagerProps) {
  const [activeTab, setActiveTab] = useState<"REGIONS" | "ORGS">("REGIONS");

  // --- SEARCH STATE ---
  const [regionSearch, setRegionSearch] = useState("");
  const [orgSearch, setOrgSearch] = useState("");

  // --- REGION STATE ---
  const [newRegionName, setNewRegionName] = useState("");
  const [newRegionInternal, setNewRegionInternal] = useState(false);

  // --- ORG STATE ---
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgRegionId, setNewOrgRegionId] = useState<number | "">("");
  const [newOrgVote, setNewOrgVote] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FILTERED LISTS ---
  const filteredRegions = regions.filter((r) =>
    r.name.toLowerCase().includes(regionSearch.toLowerCase()),
  );

  const filteredOrgs = organizations.filter(
    (o) =>
      o.name.toLowerCase().includes(orgSearch.toLowerCase()) ||
      o.region.name.toLowerCase().includes(orgSearch.toLowerCase()),
  );

  // --- HANDLERS ---
  const handleAddRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegionName) return;
    setIsSubmitting(true);
    const res = await createRegion(newRegionName, newRegionInternal);
    setIsSubmitting(false);
    if (res.success) {
      setNewRegionName("");
      alert("Region opprettet!");
    } else {
      alert(res.message);
    }
  };

  const handleAddOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || newOrgRegionId === "") return;
    setIsSubmitting(true);
    const res = await createOrganization(
      newOrgName,
      Number(newOrgRegionId),
      newOrgVote,
    );
    setIsSubmitting(false);
    if (res.success) {
      setNewOrgName("");
      alert("Organisasjon opprettet!");
    } else {
      alert(res.message);
    }
  };

  const handleDelete = async (type: "REGION" | "ORG", id: number) => {
    if (!confirm("Er du sikker? Dette kan ikke angres.")) return;
    const res =
      type === "REGION" ? await deleteRegion(id) : await deleteOrganization(id);
    if (!res.success) alert(res.message);
  };

  return (
    <div className="space-y-6">
      {/* TABS */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("REGIONS")}
          className={`px-6 py-3 font-medium flex items-center gap-2 ${
            activeTab === "REGIONS"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          <BiMap /> Regioner
        </button>
        <button
          onClick={() => setActiveTab("ORGS")}
          className={`px-6 py-3 font-medium flex items-center gap-2 ${
            activeTab === "ORGS"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          <BiBuilding /> Organisasjoner
        </button>
      </div>

      {/* --- REGIONS VIEW --- */}
      {activeTab === "REGIONS" && (
        <div className="space-y-6">
          <form
            onSubmit={handleAddRegion}
            className="bg-gray-50 p-4 rounded-lg border flex gap-4 items-end"
          >
            <div className="flex-grow">
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Navn
              </label>
              <input
                className="w-full border rounded p-2"
                value={newRegionName}
                onChange={(e) => setNewRegionName(e.target.value)}
                placeholder="F.eks. Vestland"
              />
            </div>
            <div className="pb-3 flex items-center">
              <input
                type="checkbox"
                id="internal"
                checked={newRegionInternal}
                onChange={(e) => setNewRegionInternal(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="internal" className="text-sm">
                Intern/Admin?
              </label>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <BiPlus className="size-5" />
            </button>
          </form>

          {/* Region Search Bar */}
          <div className="relative">
            <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Søk i regioner..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={regionSearch}
              onChange={(e) => setRegionSearch(e.target.value)}
            />
          </div>

          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Navn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRegions.map((r) => (
                  <tr key={r.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {r.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {r.internal ? "Intern/Admin" : "Standard"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete("REGION", r.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <BiTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ORGANIZATIONS VIEW --- */}
      {activeTab === "ORGS" && (
        <div className="space-y-6">
          <form
            onSubmit={handleAddOrg}
            className="bg-gray-50 p-4 rounded-lg border grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Navn
              </label>
              <input
                className="w-full border rounded p-2"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="F.eks. Elevrådet..."
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Tilhørighet
              </label>
              <select
                className="w-full border rounded p-2 bg-white"
                value={newOrgRegionId}
                onChange={(e) => setNewOrgRegionId(Number(e.target.value))}
              >
                <option value="" disabled>
                  Velg Region
                </option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="pb-3 flex items-center">
              <input
                type="checkbox"
                id="canVote"
                checked={newOrgVote}
                onChange={(e) => setNewOrgVote(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="canVote" className="text-sm">
                Stemmerett?
              </label>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full md:w-auto flex justify-center"
            >
              <BiPlus className="size-5" /> Legg til
            </button>
          </form>

          {/* Org Search Bar */}
          <div className="relative">
            <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Søk i organisasjoner eller regioner..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={orgSearch}
              onChange={(e) => setOrgSearch(e.target.value)}
            />
          </div>

          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Navn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Region
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stemmerett
                  </th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrgs.map((o) => (
                  <tr key={o.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {o.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {o.region.name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {o.canVote ? (
                        <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded-full text-xs font-bold">
                          <BiCheck /> Ja
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-1 rounded-full text-xs font-bold">
                          <BiX /> Nei
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete("ORG", o.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <BiTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
