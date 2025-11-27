"use client";

import { useState } from "react";
import { BiUser, BiPencil } from "react-icons/bi";
import ParticipantDetailDialog from "./participant-detail-dialog"; // New component for details
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

  const handleOpenDialog = (participant: any) => {
    setSelectedParticipant(participant);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedParticipant(null);
    setIsDialogOpen(false);
    // NOTE: If editing is enabled, you may need router.refresh() here to see changes
  };

  const regions = Object.keys(groupedData);

  return (
    <>
      {regions.map((regionName) => (
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
                  <th className="px-6 py-3 w-1/12"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.values(groupedData[regionName]).map(
                  (orgData, index) => (
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
                            {orgData.delegates.map((d) => (
                              <Link
                                key={d.id}
                                href={`/dashboard/deltakere/${d.id}`}
                                className="flex items-center gap-1.5 text-indigo-600 hover:underline"
                              >
                                <BiUser className="size-4 flex-shrink-0" />
                                <span className="truncate">{d.name}</span>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-xs">
                            Ingen delegater
                          </span>
                        )}
                      </td>

                      {/* Observers List */}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {orgData.observers.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {orgData.observers.map((o) => (
                              <Link
                                key={o.id}
                                href={`/dashboard/deltakere/${o.id}`}
                                className="flex items-center gap-1.5 text-indigo-600 hover:underline"
                              >
                                <BiUser className="size-4 flex-shrink-0" />
                                <span className="truncate">{o.name}</span>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-xs">
                            Ingen observatører
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        {canWrite && (
                          <BiPencil className="size-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

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
