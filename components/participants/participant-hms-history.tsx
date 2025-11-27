"use client";

import { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import HmsIncidentDialog from "@/components/hms/hms-incident-dialog";
import GetHMSType from "@/components/ts/get-hms-type";
import { BiChevronDown, BiChevronUp, BiFirstAid } from "react-icons/bi";

interface HmsHistoryProps {
  incidents: any[];
  canWrite: boolean;
  canDelete: boolean;

  participantId: number;
  participantName: string;
  participantDisplayId: string | null;
}

export default function ParticipantHmsHistory({
  incidents,
  canWrite,
  canDelete,
  participantId,
  participantName,
  participantDisplayId,
}: HmsHistoryProps) {
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // 💡 Collapsed by default
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRowClick = (incident: any) => {
    const incidentWithContext = {
      ...incident,
      participantObjectId: participantId, // The Foreign Key ID
      participantName: participantName, // Name for display
      participantId: participantDisplayId, // Skiltnummer string
    };

    setSelectedIncident(incidentWithContext);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedIncident(null);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("no-NO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* 💡 Clickable Header for Toggling */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="cursor-pointer flex items-center justify-between mb-4 select-none"
      >
        <div className="flex items-center gap-3">
          <BiFirstAid className="size-6 text-red-600" />
          <h2 className="text-2xl font-bold text-red-900">HMS Historikk</h2>
          <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full font-semibold">
            Sensitivt
          </span>
        </div>

        <button className="text-red-700 hover:bg-red-100 p-1 rounded-full transition-colors">
          {isExpanded ? (
            <BiChevronUp className="size-6" />
          ) : (
            <BiChevronDown className="size-6" />
          )}
        </button>
      </div>

      {/* 💡 Conditional Rendering based on isExpanded */}
      {isExpanded ? (
        <div className="bg-white shadow-sm border rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tidspunkt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Beskrivelse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rapportert Av
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incidents.map((incident) => (
                <tr
                  key={incident.id}
                  onClick={() => handleRowClick(incident)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(incident.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                    {GetHMSType(incident.incidentType)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {incident.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {incident.reportedBy?.email || "Ukjent"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // 💡 Summary View when Collapsed
        <div
          onClick={() => setIsExpanded(true)}
          className="text-sm text-red-800 italic bg-white/50 p-3 rounded border border-red-100 cursor-pointer hover:bg-red-50 transition-colors text-center"
        >
          Klikk for å vise {incidents.length} registrerte hendelser.
        </div>
      )}

      {/* Render the Dialog */}
      <Dialog open={isOpen} onClose={handleClose} className="relative z-[60]">
        <DialogBackdrop className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl bg-white">
            {selectedIncident && (
              <HmsIncidentDialog
                incident={selectedIncident}
                onCloseAction={handleClose}
                canWrite={canWrite}
                canDelete={canDelete}
              />
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
