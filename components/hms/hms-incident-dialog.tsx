"use client";

import { DialogTitle } from "@headlessui/react";
import { useState, useEffect, useCallback } from "react";
import {
  addHmsAction,
  deleteHmsIncident,
  getHmsActionsByIncident,
  updateHmsIncidentDetails,
  searchParticipants, // Needed for the search component
  createHmsMedicalLeave, // 💡 New
  updateHmsMedicalLeave, // 💡 New
} from "@/app/actions/hms-actions";
import {
  BiTrash,
  BiPlusCircle,
  BiSearch,
  BiUserX,
  BiFirstAid,
  BiUser,
} from "react-icons/bi";
import Link from "next/link";
import GetHMSType from "../ts/get-hms-type";

// --- Type Definitions ---
type IncidentDetails = {
  id: number;
  incidentType: string;
  description: string;
  location: string | null;
  createdAt: Date;
  reportedBy: { email: string };
  participantId: string | null;
  participantName: string | null;
  participantObjectId: number | null; // The linked Participant ID
  case?: {
    id: number;
    formReply: {
      from: Date;
      to: Date;
    };
  } | null;
};
type HmsAction = {
  id: number;
  action: string;
  timestamp: string;
  user: { email: string };
};
type SearchResult = {
  id: number;
  label: string;
  name: string;
  participantId: string | null;
};

interface ParticipantSearchProps {
  onSelect: (participant: SearchResult | null) => void;
  initialParticipantName: string | null;
}
interface HmsIncidentDialogProps {
  incident: IncidentDetails;
  onCloseAction: () => void;
  canWrite: boolean;
  canDelete: boolean;
}

// 💡 ENUM HELPER
const HmsTypeOptions = {
  ILLNESS: "Sykdom",
  ACCIDENT: "Ulykke/Skade",
  ALLERGY: "Allergisk Reaksjon",
  OTHER: "Annet",
};

// --- NEW: Participant Search Component ---
const ParticipantSearchAndSelect: React.FC<ParticipantSearchProps> = ({
  onSelect,
  initialParticipantName,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedName, setSelectedName] = useState(
    initialParticipantName || "",
  );

  // Debounced search logic
  const fetchResults = useCallback(async (query: string) => {
    if (query.length < 3) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    const res = await searchParticipants(query);
    setResults(res as SearchResult[]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchResults(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, fetchResults]);

  const handleSelect = (p: SearchResult) => {
    setSelectedName(p.label);
    onSelect(p);
    setResults([]); // Close dropdown
  };

  const handleClear = () => {
    setSelectedName("");
    setSearchQuery("");
    onSelect(null);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700">
        Deltaker (Søk)
      </label>
      <div className="mt-1 flex rounded-md shadow-sm">
        <BiSearch className="absolute left-3 top-2.5 size-5 text-gray-400" />
        <input
          type="text"
          value={selectedName || searchQuery}
          onChange={(e) => {
            setSelectedName(""); // Clear static selection when typing
            setSearchQuery(e.target.value);
          }}
          placeholder="Søk etter navn eller skiltnummer..."
          className="pl-10 block w-full border rounded-l-md p-2 disabled:bg-gray-100"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={handleClear}
          disabled={!selectedName && !searchQuery}
          className="p-2 border border-l-0 rounded-r-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          title="Fjern valg"
        >
          <BiUserX className="size-5" />
        </button>
      </div>

      {/* Dropdown Results */}
      {results.length > 0 && (
        <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {results.map((p) => (
            <li
              key={p.id}
              onClick={() => handleSelect(p)}
              className="p-2 cursor-pointer hover:bg-indigo-50 text-sm border-b"
            >
              {p.label}
            </li>
          ))}
        </ul>
      )}
      {isLoading && searchQuery.length > 2 && (
        <p className="text-sm p-2 text-gray-500">Laster...</p>
      )}
    </div>
  );
};
// --- END ParticipantSearchAndSelect ---

export default function HmsIncidentDialog({
  incident,
  onCloseAction,
  canWrite,
  canDelete,
}: HmsIncidentDialogProps) {
  const [newActionText, setNewActionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actions, setActions] = useState<HmsAction[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // 💡 STATE FOR INCIDENT DETAILS, derived from incident prop
  const [details, setDetails] = useState({
    incidentType: incident.incidentType,
    description: incident.description,
    location: incident.location || "",
    participantId: incident.participantId || "",
    participantName: incident.participantName || "",
    participantObjectId: incident.participantObjectId || null,
  });

  const getLocalISOString = () => {
    const date = new Date();

    const localIso = date.toLocaleString("sv-SE", {
      timeZone: "Europe/Oslo",
      hour12: false,
    });
    console.log(localIso);
    console.log(new Date().toISOString());
    return localIso;
  };

  const [leaveDates, setLeaveDates] = useState({
    from: incident.case?.formReply.from
      ? new Date(incident.case.formReply.from).toISOString().slice(0, 16)
      : getLocalISOString().slice(0, 16),
    to: incident.case?.formReply.to
      ? new Date(incident.case.formReply.to).toISOString().slice(0, 16)
      : "", // Default +1 hour
  });
  const [isLeaveEditing, setIsLeaveEditing] = useState(!incident.case); // Open edit if no case exists

  // 💡 STATE FOR LIVE PARTICIPANT SELECTION (used if user searches/selects new person)

  // --- EFFECT: FETCH ACTIONS ---
  useEffect(() => {
    async function loadActions() {
      const fetchedActions = await getHmsActionsByIncident(incident.id);
      setActions(fetchedActions as HmsAction[]);
    }
    loadActions();
  }, [incident.id, isSubmitting]);

  // --- HANDLER: PARTICIPANT SELECTION (Updates internal details state) ---
  const handleParticipantSelect = (p: SearchResult | null) => {
    // Update details state to reflect the selection
    setDetails((prev) => ({
      ...prev,
      participantObjectId: p ? p.id : null,
      participantName: p ? p.name : "",
      participantId: p ? p.participantId || "" : "",
    }));
  };

  // --- HANDLER: DETAIL INPUT CHANGE ---
  const handleDetailChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- HANDLER: UPDATE INCIDENT DETAILS (SEPARATE ACTION) ---
  const handleUpdateIncident = async () => {
    if (!canWrite) return;
    setIsSubmitting(true);
    try {
      await updateHmsIncidentDetails(incident.id, {
        ...details,
        // Use the latest linked ID from state for the DB update
        participantObjectId: details.participantObjectId,
      });
      setIsEditing(false);
      alert("Hendelsesdetaljer oppdatert!");
    } catch (_error) {
      alert("Klarte ikke oppdatere hendelsesdetaljer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLER: ADD ACTION ---
  const handleAddAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText || !canWrite) return;

    setIsSubmitting(true);
    try {
      await addHmsAction(incident.id, newActionText);
      const updatedActions = await getHmsActionsByIncident(incident.id);
      setActions(updatedActions as HmsAction[]);
      setNewActionText("");
    } catch (_error) {
      alert("Klarte ikke legge til handling.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveSubmit = async () => {
    if (!canWrite) return;
    if (!details.participantObjectId) {
      alert("Du må knytte en deltaker til hendelsen før du kan gi permisjon.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (incident.case) {
        // Update existing
        await updateHmsMedicalLeave(
          incident.case.id,
          new Date(leaveDates.from),
          new Date(leaveDates.to),
        );
        alert("Permisjon oppdatert.");
        setIsLeaveEditing(false);
      } else {
        // Create new
        await createHmsMedicalLeave(
          incident.id,
          details.participantObjectId,
          new Date(leaveDates.from),
          new Date(leaveDates.to),
        );
        alert("Permisjon opprettet.");
        setIsLeaveEditing(false);
        // Ideally, force refresh or close dialog to see updated state
      }
    } catch (e) {
      alert("Feil ved lagring av permisjon.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeEarly = () => {
    const now = new Date();
    setLeaveDates((prev) => ({ ...prev, to: now.toISOString().slice(0, 16) }));
  };

  // --- HANDLER: DELETE INCIDENT ---
  const handleDelete = async () => {
    if (!confirm(`Er du sikker på at du vil slette hendelse #${incident.id}?`))
      return;

    try {
      await deleteHmsIncident(incident.id);
      onCloseAction();
    } catch (error) {
      alert("Klarte ikke slette hendelsen.");
    }
  };

  // 💡 Get initial participant display name for the search bar
  const initialParticipantDisplayName =
    details.participantName && details.participantId
      ? `${details.participantName} (${details.participantId})`
      : details.participantName;

  return (
    <div className="bg-white p-8">
      <DialogTitle className="text-2xl font-bold mb-4 border-b pb-2 flex justify-between items-center">
        <span>
          Hendelse #{incident.id}: {GetHMSType(incident.incidentType)}
        </span>
        {/* EDIT BUTTON */}
        {canWrite && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`text-sm px-3 py-1 rounded transition-colors ${
              isEditing
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isEditing ? "Avbryt Redigering" : "Rediger Detaljer"}
          </button>
        )}
      </DialogTitle>

      <div className="grid md:grid-cols-2 gap-8">
        {/* --- LEFT COLUMN: INCIDENT DETAILS (READ/EDIT MODE) --- */}
        <div className="space-y-4 pr-4 border-r">
          <h3 className="text-lg font-semibold border-b mb-2">Detaljer</h3>

          {/* 💡 PARTICIPANT SEARCH/DISPLAY BLOCK */}
          <div className="pt-1 pb-2">
            {isEditing ? (
              // SHOW SEARCH when editing
              <ParticipantSearchAndSelect
                onSelect={handleParticipantSelect}
                initialParticipantName={initialParticipantDisplayName}
              />
            ) : // SHOW READ-ONLY LINK when viewing
            details.participantObjectId ? (
              <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg flex items-center gap-3">
                <BiUser className="text-blue-600 size-5" />
                <div>
                  <Link
                    href={`/hjem/deltakere/${details.participantObjectId}`}
                    className="text-sm font-bold text-blue-900 hover:underline"
                  >
                    {details.participantName}
                  </Link>
                  <p className="text-xs text-blue-700">
                    Skiltnr: {details.participantId}
                  </p>
                </div>
              </div>
            ) : (
              <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded">
                Ikke knyttet til deltaker
              </span>
            )}
          </div>

          {/* Incident Type & Location */}
          <div className="flex justify-between gap-4">
            <label className="block w-full">
              <span className="text-sm font-medium text-gray-700">Type</span>
              <select
                name="incidentType"
                value={details.incidentType}
                onChange={handleDetailChange}
                disabled={!isEditing}
                className="mt-1 block w-full border rounded p-2 disabled:bg-gray-100 disabled:opacity-90"
              >
                {Object.entries(HmsTypeOptions).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="block w-full">
              <span className="text-sm font-medium text-gray-700">Sted</span>
              <input
                type="text"
                name="location"
                value={details.location}
                onChange={handleDetailChange}
                disabled={!isEditing}
                className="mt-1 block w-full border rounded p-2 disabled:bg-gray-100"
              />
            </label>
          </div>

          {/* Description */}
          <label className="block w-full">
            <span className="text-sm font-medium text-gray-700">
              Beskrivelse
            </span>
            <textarea
              name="description"
              value={details.description}
              onChange={handleDetailChange}
              disabled={!isEditing}
              rows={4}
              className="mt-1 block w-full border rounded p-2 disabled:bg-gray-100 resize-none"
            />
          </label>

          {/* Update Button (Only visible when editing is active) */}
          {isEditing && canWrite && (
            <button
              onClick={handleUpdateIncident}
              disabled={isSubmitting}
              className="mt-3 w-full bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? "Lagrer..." : "Lagre Detaljer"}
            </button>
          )}

          <div className="mt-6 pt-4 border-t text-sm text-gray-500">
            <p>
              <strong>Rapportert av:</strong> {incident.reportedBy.email}
            </p>
            <p>
              <strong>Tidspunkt rapportert:</strong>{" "}
              {incident.createdAt.toLocaleString()}
            </p>
          </div>
        </div>

        {/* --- RIGHT COLUMN: ACTIONS (ALWAYS EDITABLE) --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Tiltak (Logg)</h3>

          {/* List of Actions */}
          <div className="h-48 overflow-y-auto border p-2 rounded bg-gray-50 space-y-2">
            {actions.length === 0 ? (
              <p className="text-gray-500 italic text-sm">
                Ingen tiltak registrert enda.
              </p>
            ) : (
              actions.map((action) => (
                <div key={action.id} className="text-sm border-b pb-1">
                  <p className="font-medium text-gray-800">{action.action}</p>
                  <p className="text-xs text-gray-600">
                    Av {action.user.email} kl.{" "}
                    {new Date(action.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>

          {canWrite && (
            <>
              <form onSubmit={handleAddAction} className="flex gap-2">
                <input
                  type="text"
                  value={newActionText}
                  onChange={(e) => setNewActionText(e.target.value)}
                  placeholder="Registrer nytt tiltak (medisiner, hjelp, osv.)"
                  required
                  className="flex-grow border rounded p-2"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newActionText}
                  className="bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700 disabled:opacity-50"
                >
                  <BiPlusCircle className="size-5" />
                </button>
              </form>

              {/* 1. MEDICAL LEAVE SECTION */}
              <div
                className={`p-4 rounded-lg border ${
                  incident.case
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <h3 className="text-lg font-bold flex items-center gap-2 mb-3 text-gray-800">
                  <BiFirstAid /> Medisinsk Permisjon
                </h3>

                {incident.case && !isLeaveEditing ? (
                  // VIEW MODE
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-bold">Fra:</span>{" "}
                      {new Date(incident.case.formReply.from).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-bold">Til:</span>{" "}
                      {new Date(incident.case.formReply.to).toLocaleString()}
                    </p>
                    {canWrite && (
                      <button
                        onClick={() => setIsLeaveEditing(true)}
                        className="mt-2 w-full bg-white border border-gray-300 text-gray-700 py-1 rounded text-sm hover:bg-gray-50"
                      >
                        Endre / Utvid
                      </button>
                    )}
                  </div>
                ) : (
                  // EDIT/CREATE MODE
                  <div className="space-y-3">
                    {!incident.case && (
                      <p className="text-xs text-gray-600">
                        Opprett automatisk permisjonssak for denne deltakeren.
                      </p>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">
                        Fra
                      </label>
                      <input
                        type="datetime-local"
                        value={leaveDates.from}
                        onChange={(e) =>
                          setLeaveDates((p) => ({ ...p, from: e.target.value }))
                        }
                        className="w-full border rounded p-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <label className="block text-xs font-bold text-gray-600 mb-1">
                          Til
                        </label>
                        {incident.case && (
                          <button
                            onClick={handleRevokeEarly}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Avslutt nå
                          </button>
                        )}
                      </div>
                      <input
                        type="datetime-local"
                        value={leaveDates.to}
                        onChange={(e) =>
                          setLeaveDates((p) => ({ ...p, to: e.target.value }))
                        }
                        className="w-full border rounded p-1.5 text-sm"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleLeaveSubmit}
                        disabled={isSubmitting}
                        className="flex-1 bg-blue-600 text-white py-1.5 rounded text-sm font-bold hover:bg-blue-700"
                      >
                        {incident.case
                          ? "Lagre Endringer"
                          : "Innvilg Permisjon"}
                      </button>
                      {incident.case && (
                        <button
                          onClick={() => setIsLeaveEditing(false)}
                          className="px-3 bg-gray-200 rounded text-sm"
                        >
                          Avbryt
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- FOOTER / ACTIONS --- */}
      <div className="mt-8 pt-4 border-t flex justify-between">
        <button
          onClick={onCloseAction}
          className="bg-gray-200 text-gray-700 rounded px-4 py-2 hover:bg-gray-300"
        >
          Lukk
        </button>

        {canDelete && (
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white rounded px-4 py-2 hover:bg-red-700"
          >
            <BiTrash className="inline size-4 mr-1" /> Slett Hendelse
          </button>
        )}
      </div>
    </div>
  );
}
