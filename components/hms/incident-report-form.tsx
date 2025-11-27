"use client";

import { useFormStatus } from "react-dom";
import {
  submitHmsIncident,
  searchParticipants,
} from "@/app/actions/hms-actions";
import { useState, useCallback, useEffect } from "react";
import { BiSearch, BiUserX, BiPlusCircle } from "react-icons/bi";

// Define SearchResult type (must match Server Action output)
type SearchResult = {
  id: number;
  label: string;
  name: string;
  participantId: string | null;
};

interface IncidentReportFormProps {
  onCloseAction: () => void;
}

// --- Participant Search Component (Shared Logic) ---
interface ParticipantSearchProps {
  onSelect: (participant: SearchResult | null) => void;
}

const ParticipantSearchAndSelect: React.FC<ParticipantSearchProps> = ({
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedName, setSelectedName] = useState("");

  const fetchResults = useCallback(async (query: string) => {
    // Check if query consists ONLY of numbers
    const isNumeric = /^\d+$/.test(query);

    // Apply the same logic: Allow 1 digit if numeric, otherwise require 3 chars
    if (!isNumeric && query.length < 3) {
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
    setResults([]);
  };

  const handleClear = () => {
    setSelectedName("");
    setSearchQuery("");
    onSelect(null);
  };

  return (
    <div className="relative z-10">
      <label className="block text-sm font-medium text-gray-700">
        Tilknyttet Deltaker (Søk)
      </label>
      <div className="relative mt-1 flex rounded-md shadow-sm">
        <BiSearch className="absolute left-3 top-2.5 size-5 text-gray-400" />
        <input
          type="text"
          value={selectedName || searchQuery}
          onChange={(e) => {
            setSelectedName("");
            setSearchQuery(e.target.value);
          }}
          placeholder="Søk etter navn eller skiltnummer..."
          className="pl-10 block w-full border rounded-l-md p-2 disabled:bg-gray-100"
          disabled={isLoading}
          required // Must select a participant
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

      {results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
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
    </div>
  );
};
// --- END ParticipantSearchAndSelect ---

// Helper component to show loading state
const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-red-600 text-white rounded px-6 py-3 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150"
    >
      {pending ? "Sender inn..." : "Rapporter Hendelse"}
    </button>
  );
};

export default function IncidentReportForm({
  onCloseAction,
}: IncidentReportFormProps) {
  const [formKey, setFormKey] = useState(0);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // 💡 STATE: To hold the unique Participant ID from the search component
  const [linkedParticipantId, setLinkedParticipantId] = useState<number | null>(
    null
  );

  // 💡 HANDLER: Captures the ID from the search component
  const handleParticipantSelect = (p: SearchResult | null) => {
    setLinkedParticipantId(p ? p.id : null);
  };

  const handleSubmit = async (formData: FormData) => {
    setStatus(null);

    // 1. Explicitly type the variable so 'message' is optional (?)
    // This matches the Server Action's return type flexibility.
    let result: { success: boolean; message?: string } = {
      success: false,
      message: "Ukjent feil.",
    };

    // Validation
    if (!linkedParticipantId) {
      setStatus({
        type: "error",
        message: "Vennligst søk og velg en deltaker fra listen.",
      });
      return;
    }

    formData.append("participantObjectId", String(linkedParticipantId));

    try {
      // 2. Fetch into a temporary constant first
      const response = await submitHmsIncident(formData);

      // 3. Only update 'result' if we got a valid response back.
      // This guards against 'undefined' overriding our default error state.
      if (response) {
        result = response;
      }
    } catch (error) {
      console.error("Critical submission error:", error);
      result = {
        success: false,
        message: "Kritisk nettverksfeil. Vennligst sjekk konsollen.",
      };
    }

    // 4. Check success
    if (result.success) {
      setStatus({
        type: "success",
        message: "Hendelse sendt inn. Takk for rapporten.",
      });
      setFormKey((prev) => prev + 1);
      setLinkedParticipantId(null);

      setTimeout(() => {
        onCloseAction();
      }, 1500);
    } else {
      setStatus({
        type: "error",
        // Use a fallback string in case message is undefined
        message: result.message || "Noe gikk galt ved innsending.",
      });
    }
  };

  return (
    <form
      key={formKey}
      action={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-lg shadow-xl border"
    >
      {status && (
        <div
          className={`p-4 rounded-md font-medium ${
            status.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {status.message}
        </div>
      )}

      {/* 1. Incident Type */}
      <div>
        <label
          htmlFor="incidentType"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Type Hendelse
        </label>
        <select
          id="incidentType"
          name="incidentType"
          required
          className="block w-full border border-gray-300 rounded-md shadow-sm p-3 bg-white"
        >
          <option value="">Velg type</option>
          <option value="ILLNESS">Sykdom</option>
          <option value="ACCIDENT">Ulykke/Skade</option>
          <option value="ALLERGY">Allergisk Reaksjon</option>
          <option value="OTHER">Annet</option>
        </select>
      </div>

      {/* 2. Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Detaljer/Beskrivelse
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          className="block w-full border border-gray-300 rounded-md shadow-sm p-3 resize-none"
          placeholder="Hva skjedde? Hva ble gjort umiddelbart?"
        />
      </div>

      {/* 💡 REPLACEMENT: Participant Search Component */}
      <ParticipantSearchAndSelect onSelect={handleParticipantSelect} />

      {/* 4. Location */}
      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Sted
        </label>
        <input
          id="location"
          name="location"
          type="text"
          required
          className="block w-full border border-gray-300 rounded-md shadow-sm p-3"
          placeholder="E.g. Kantina, sal 3, utenfor hovedinngangen"
        />
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-between items-center pt-4">
        <button
          type="button"
          onClick={onCloseAction}
          className="bg-gray-200 text-gray-700 rounded px-6 py-3 hover:bg-gray-300 transition duration-150"
        >
          Lukk
        </button>
        <SubmitButton />
      </div>
    </form>
  );
}
