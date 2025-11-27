"use client";

import { useState, useEffect } from "react"; // 👈 Added useEffect
import { BiPlus, BiPencil } from "react-icons/bi"; // 👈 Added BiPencil for Edit
import IncidentReportForm from "./incident-report-form";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import HmsIncidentDialog from "./hms-incident-dialog"; // 👈 NEW: Dialog for viewing/editing

// 💡 NEW IMPORTS: Re-import the fetcher for the polling loop
import { getAllHmsIncidents } from "@/app/actions/hms-actions";
import GetHMSType from "../ts/get-hms-type";

// Simplified type for the list (must match what the server fetches)
interface Incident {
  id: number;
  incidentType: string;
  description: string;
  createdAt: Date;
  reportedBy: { email: string };
  participantName: string | null;
  location: string | null;
  participantId: string | null;
  participantObjectId: number | null;

  // 💡 FIX: Change 'string' to 'string | null' inside the object
  participantObject: {
    name: string;
    participant_id: string | null;
  } | null;
}

interface HmsDashboardProps {
  initialIncidents: Incident[];
  canCreate: boolean;
  // Assume read/write is covered by canCreate, or pass separately if needed
  canWrite: boolean;
  canDelete: boolean;
}

const formatDateTime = (date: Date) => {
  // 💡 FIX: Pass "no-NO" as the first argument to enforce consistent formatting
  // This ensures 15:18 (24h) is used on both Server and Client
  return new Date(date).toLocaleString("no-NO", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getParticipantDisplay = (incident: Incident) => {
  if (incident.participantObject) {
    return incident.participantObject.name; // Best source: Linked DB Object
  }
  return incident.participantName || "Ikke spesifisert"; // Fallback: Manual text or placeholder
};

export default function HmsIncidentDashboard({
  initialIncidents,
  canCreate,
  canWrite,
  canDelete,
}: HmsDashboardProps) {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false); // State for the view/edit dialog
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );

  // Function to close the main form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    // After closing the form, force a refresh immediately
    fetchIncidents();
  };

  // Function to close the view/edit dialog
  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
    setSelectedIncident(null);
    // After closing the edit dialog, force a refresh immediately
    fetchIncidents();
  };

  const fetchIncidents = async () => {
    const freshIncidents = await getAllHmsIncidents();
    // Since incidents.createdAt is a Date object on the client now,
    // ensure you re-process the data if the server returns date strings:
    const processedIncidents = freshIncidents.map((i) => ({
      ...i,
      createdAt: new Date(i.createdAt),
    })) as Incident[];

    setIncidents(processedIncidents);
  };

  // 💡 POLLING EFFECT
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchIncidents();
    }, 10000); // Fetch every 10 seconds

    return () => clearInterval(intervalId); // Cleanup
  }, []);

  // Function to open the view/edit dialog
  const handleViewIncident = (incident: Incident) => {
    // Normalize data for the dialog
    const dialogIncident = {
      ...incident,
      // If linked object exists, prefer its data for the dialog display
      participantName:
        incident.participantObject?.name ?? incident.participantName,
      participantId:
        incident.participantObject?.participant_id ?? incident.participantId,
    };

    setSelectedIncident(dialogIncident);
    setIsViewDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">HMS Hendelser</h1>

        {canCreate && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-red-600 text-white rounded-full px-4 py-2 text-lg hover:bg-red-700 transition duration-150"
            title="Rapporter ny hendelse"
          >
            <BiPlus className="size-6" />
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border">
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
                Deltaker
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Rapportert Av
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {incidents.map((incident) => (
              <tr
                key={incident.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewIncident(incident)} // 💡 Clickable row
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDateTime(incident.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-700">
                  {GetHMSType(incident.incidentType)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getParticipantDisplay(incident)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {incident.reportedBy.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <BiPencil className="size-4 text-indigo-600 hover:text-indigo-900 mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {incidents.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            Ingen hendelser er registrert.
          </div>
        )}
      </div>

      {/* 1. Modal Dialog for New Incident Form */}
      <Dialog
        open={isFormOpen}
        onClose={handleCloseForm}
        className="relative z-50" // Ensure high z-index
      >
        {/* 1a. Backdrop: Must be fixed and cover the entire screen */}
        <DialogBackdrop className="fixed inset-0 bg-black/50" />

        {/* 1b. Wrapper: Centers the panel within the viewport */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* 1c. Dialog Panel: The actual content container */}
          <DialogPanel className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl bg-white">
            {/* Pass onCloseAction to the form */}
            <IncidentReportForm onCloseAction={handleCloseForm} />
          </DialogPanel>
        </div>
      </Dialog>

      {/* 2. Modal Dialog for Viewing/Editing Incident and Actions */}
      <Dialog
        open={isViewDialogOpen}
        onClose={handleCloseViewDialog}
        className="relative z-[60]" // Even higher z-index
      >
        <DialogBackdrop className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl bg-white">
            {selectedIncident && (
              <HmsIncidentDialog
                incident={selectedIncident}
                onCloseAction={handleCloseViewDialog}
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
