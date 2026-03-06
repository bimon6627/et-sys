"use client";

import { useState, useMemo, useEffect } from "react";
import {
  BiUser,
  BiSearch,
  BiX,
  BiChevronDown,
  BiChevronRight,
} from "react-icons/bi";
import ParticipantDetailDialog from "./participant-detail-dialog";
import Link from "next/link";

interface ParticipantsDashboardProps {
  conferenceId: string;
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
  conferenceId,
  groupedData,
  canWrite,
}: ParticipantsDashboardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsedRegions, setCollapsedRegions] = useState<
    Record<string, boolean>
  >({});

  const handleCloseDialog = () => {
    setSelectedParticipant(null);
    setIsDialogOpen(false);
  };

  useEffect(() => {
    if (searchTerm) {
      setCollapsedRegions({});
    }
  }, [searchTerm]);

  const toggleRegion = (regionName: string) => {
    setCollapsedRegions((prev) => ({
      ...prev,
      [regionName]: !prev[regionName],
    }));
  };

  const filteredRegions = useMemo(() => {
    if (!searchTerm) return Object.keys(groupedData);
    const lowerTerm = searchTerm.toLowerCase();

    const personMatches = (p: any) =>
      (p.name && p.name.toLowerCase().includes(lowerTerm)) ||
      (p.email && p.email.toLowerCase().includes(lowerTerm)) ||
      (p.tel && p.tel.includes(lowerTerm)) ||
      (p.participant_id && p.participant_id.toLowerCase().includes(lowerTerm));

    return Object.keys(groupedData).filter((regionName) => {
      const orgs = groupedData[regionName];
      return Object.values(orgs).some((orgData) => {
        if (orgData.organization.name.toLowerCase().includes(lowerTerm))
          return true;
        const hasMatchingDelegate = orgData.delegates.some(personMatches);
        const hasMatchingObserver = orgData.observers.some(personMatches);
        return hasMatchingDelegate || hasMatchingObserver;
      });
    });
  }, [groupedData, searchTerm]);

  const getFilteredOrgData = (orgData: any) => {
    if (!searchTerm) return orgData;
    const lowerTerm = searchTerm.toLowerCase();

    if (orgData.organization.name.toLowerCase().includes(lowerTerm)) {
      return orgData;
    }

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
      {/* 📱 SEARCH BAR: Adjusted padding (px-4 for mobile, md:px-8 for desktop) */}
      <div className="mb-6 sticky top-0 z-30 bg-eo-white/95 backdrop-blur py-4 border-b">
        <h1 className="text-2xl md:text-3xl px-4 md:px-8 font-bold mb-4 md:mb-6">
          Deltakeroversikt
        </h1>
        <div className="relative max-w-md px-4 md:mx-8">
          <BiSearch className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
          <input
            type="text"
            placeholder="Søk..."
            className="w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <BiX className="size-5" />
            </button>
          )}
        </div>
      </div>

      {/* 📱 CONTENT: Adjusted padding */}
      <div className="px-4 pb-8 md:p-8">
        {filteredRegions.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
            Ingen resultater funnet for "{searchTerm}".
          </div>
        ) : (
          filteredRegions.map((regionName) => {
            const isCollapsed = collapsedRegions[regionName];

            // Pre-calculate the data for this region to use in both views
            const regionDataToRender = Object.values(groupedData[regionName])
              .map((rawOrgData) => getFilteredOrgData(rawOrgData))
              .filter(
                (orgData) =>
                  orgData.delegates.length > 0 ||
                  orgData.observers.length > 0 ||
                  (searchTerm &&
                    orgData.organization.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())),
              );

            return (
              <div key={regionName} className="mb-6">
                <button
                  onClick={() => toggleRegion(regionName)}
                  className="w-full flex items-center justify-between group text-left mb-3 border-b-2 pb-1 focus:outline-none"
                >
                  <h2 className="text-xl md:text-2xl font-bold text-gray-700 flex items-center gap-2">
                    {regionName}
                    <span className="text-sm font-normal text-gray-400">
                      ({Object.keys(groupedData[regionName]).length})
                    </span>
                  </h2>
                  <div className="p-1 rounded-full text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-700 transition-colors">
                    {isCollapsed ? (
                      <BiChevronRight className="size-6" />
                    ) : (
                      <BiChevronDown className="size-6" />
                    )}
                  </div>
                </button>

                {!isCollapsed && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* 💻 DESKTOP VIEW: Table (Hidden on small screens) */}
                    <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden border">
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
                          {regionDataToRender.map(
                            (orgData: any, index: number) => (
                              <tr
                                key={index}
                                className="hover:bg-gray-50 align-top"
                              >
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                  {orgData.organization.name}
                                  {orgData.organization.canVote && (
                                    <span className="block mt-1 w-fit px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                      Stemmerett
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {renderParticipantList(
                                    orgData.delegates,
                                    conferenceId,
                                    "Ingen delegater",
                                    searchTerm,
                                  )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {renderParticipantList(
                                    orgData.observers,
                                    conferenceId,
                                    "Ingen observatører",
                                    searchTerm,
                                  )}
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* 📱 MOBILE VIEW: Cards (Visible only on small screens) */}
                    <div className="md:hidden space-y-4">
                      {regionDataToRender.map((orgData: any, index: number) => (
                        <div
                          key={index}
                          className="bg-white border rounded-lg shadow-sm p-4"
                        >
                          <div className="flex justify-between items-start mb-3 border-b pb-2">
                            <h3 className="font-bold text-gray-900">
                              {orgData.organization.name}
                            </h3>
                            {orgData.organization.canVote && (
                              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-green-100 text-green-800">
                                Stemmerett
                              </span>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                Delegater
                              </p>
                              {renderParticipantList(
                                orgData.delegates,
                                conferenceId,
                                "Ingen",
                                searchTerm,
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                Observatører
                              </p>
                              {renderParticipantList(
                                orgData.observers,
                                conferenceId,
                                "Ingen",
                                searchTerm,
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

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

// 💡 Helper to render lists consistently in both Desktop and Mobile views
function renderParticipantList(
  participants: any[],
  conferenceId: string,
  emptyText: string,
  searchTerm: string,
) {
  if (participants.length === 0) {
    return (
      <span className="text-gray-400 italic text-xs">
        {searchTerm ? "Ingen treff" : emptyText}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {participants.map((p: any) => (
        <Link
          key={p.id}
          href={`/hjem/${conferenceId}/deltakere/${p.id}`}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 active:text-indigo-900"
        >
          <div className="bg-indigo-50 p-1 rounded-full">
            <BiUser className="size-3.5" />
          </div>
          <span className="truncate text-sm">{p.name}</span>
        </Link>
      ))}
    </div>
  );
}
