"use client";

import { useState, useMemo } from "react";
import { BiUser, BiSearch, BiX } from "react-icons/bi";
import ParticipantDetailDialog from "./participant-detail-dialog";
import Link from "next/link";

interface ParticipantsDashboardProps {
  groupedData: Record<
    string,
    Record<
      string,
      {
        delegates: any[];
        observers: any[];
        organization: any;
      }
    >
  >;
  canWrite: boolean;
}

export default function ParticipantsDashboard({
  groupedData,
  canWrite,
}: ParticipantsDashboardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);

  // 💡 Search State
  const [searchTerm, setSearchTerm] = useState("");

  const handleCloseDialog = () => {
    setSelectedParticipant(null);
    setIsDialogOpen(false);
  };

  // 💡 Filter Logic
  const filteredRegions = useMemo(() => {
    if (!searchTerm) return Object.keys(groupedData); // Return all regions if no search

    const lowerTerm = searchTerm.toLowerCase();

    // Helper to check if a person matches
    const personMatches = (p: any) =>
      (p.name && p.name.toLowerCase().includes(lowerTerm)) ||
      (p.email && p.email.toLowerCase().includes(lowerTerm)) ||
      (p.tel && p.tel.includes(lowerTerm)) ||
      (p.participant_id && p.participant_id.toLowerCase().includes(lowerTerm));

    // We need to return regions that have at least one matching organization/participant
    return Object.keys(groupedData).filter((regionName) => {
      const orgs = groupedData[regionName];

      // Check if any organization in this region matches
      return Object.values(orgs).some((orgData) => {
        // If Organization Name matches, we show it (and all its people)
        if (orgData.organization.name.toLowerCase().includes(lowerTerm))
          return true;

        // Otherwise, check if any delegates or observers match
        const hasMatchingDelegate = orgData.delegates.some(personMatches);
        const hasMatchingObserver = orgData.observers.some(personMatches);

        return hasMatchingDelegate || hasMatchingObserver;
      });
    });
  }, [groupedData, searchTerm]);

  // Helper to filter the organization data for display
  // If the search term matches the Org Name, we show everyone.
  // If not, we only show the specific people who matched.
  const getFilteredOrgData = (orgData: any) => {
    if (!searchTerm) return orgData;
    const lowerTerm = searchTerm.toLowerCase();

    // If Org matches, return everything
    if (orgData.organization.name.toLowerCase().includes(lowerTerm)) {
      return orgData;
    }

    // Otherwise filter lists
    const personMatches = (p: any) =>
      (p.name && p.name.toLowerCase().includes(lowerTerm)) ||
      (p.email && p.email.toLowerCase().includes(lowerTerm)) ||
      (p.tel && p.tel.includes(lowerTerm)) ||
      (p.participant_id && p.participant_id.toLowerCase().includes(lowerTerm));

    return {
      ...orgData,
      delegates: orgData.delegates.filter(personMatches),
      observers: orgData.observers.filter(personMatches),
    };
  };

  return (
    <>
      {/* 💡 Search Bar */}
      <div className="mb-8 relative">
        <div className="relative max-w-md">
          <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
          <input
            type="text"
            placeholder="Søk etter navn, e-post, skole eller skiltnr..."
            className="w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <BiX className="size-5" />
            </button>
          )}
        </div>
      </div>

      {filteredRegions.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
          Ingen resultater funnet for "{searchTerm}".
        </div>
      ) : (
        filteredRegions.map((regionName) => (
          <div key={regionName} className="mb-10">
            <h2 className="text-2xl font-bold mb-3 border-b-2 pb-1 text-gray-700">
              {regionName}
            </h2>

            <div className="bg-white shadow-md rounded-lg overflow-hidden border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/4">
                      Organisasjon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/3">
                      Delegater
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/3">
                      Observatører
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.values(groupedData[regionName])
                    // 💡 Apply filtering logic here
                    .map((rawOrgData) => getFilteredOrgData(rawOrgData))
                    // Only render rows that have data left after filtering
                    .filter(
                      (orgData) =>
                        orgData.delegates.length > 0 ||
                        orgData.observers.length > 0 ||
                        (searchTerm &&
                          orgData.organization.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())),
                    )
                    .map((orgData: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50 align-top">
                        {/* Organization Name */}
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {orgData.organization.name}
                          {orgData.organization.canVote && (
                            <span className="block mt-1 w-fit px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Stemmerett
                            </span>
                          )}
                        </td>

                        {/* Delegates List */}
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {orgData.delegates.length > 0 ? (
                            <div className="flex flex-col gap-2">
                              {orgData.delegates.map((d: any) => (
                                <Link
                                  key={d.id}
                                  href={`/hjem/deltakere/${d.id}`}
                                  className="flex items-center gap-1.5 text-indigo-600 hover:underline"
                                >
                                  <BiUser className="size-4 flex-shrink-0" />
                                  <span className="truncate">{d.name}</span>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-xs">
                              {searchTerm ? "Ingen treff" : "Ingen delegater"}
                            </span>
                          )}
                        </td>

                        {/* Observers List */}
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {orgData.observers.length > 0 ? (
                            <div className="flex flex-col gap-2">
                              {orgData.observers.map((o: any) => (
                                <Link
                                  key={o.id}
                                  href={`/hjem/deltakere/${o.id}`}
                                  className="flex items-center gap-1.5 text-indigo-600 hover:underline"
                                >
                                  <BiUser className="size-4 flex-shrink-0" />
                                  <span className="truncate">{o.name}</span>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-xs">
                              {searchTerm
                                ? "Ingen treff"
                                : "Ingen observatører"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {/* --- Participant Detail Dialog --- */}
      {selectedParticipant && (
        <ParticipantDetailDialog
          open={isDialogOpen}
          onCloseAction={handleCloseDialog}
          participant={selectedParticipant}
          canWrite={canWrite}
        />
      )}
    </>
  );
}
