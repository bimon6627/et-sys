"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  BiCheckbox,
  BiSolidCheckboxChecked,
  BiSolidDownArrow,
  BiSolidSortAlt,
  BiSolidUpArrow,
} from "react-icons/bi";
// Import server action
import { getFilteredCases } from "@/app/actions/case-actions";
import CaseDialog from "./case-dialog";
import getStatusSymbol from "./status-symbol";
import { getEventConfig } from "@/app/actions/config-actions";
import GetParticipantReturning from "./ts/get-participant-returning";

// Helper: Prioritize Linked Participant Data
const getDisplayName = (c: any) =>
  c.participant?.name || c.formReply?.name || "Ukjent";
const getDisplayId = (c: any) =>
  c.participant?.participant_id || c.formReply?.participant_id || "-";
const getDisplayEmail = (c: any) =>
  c.participant?.email || c.formReply?.email || "-";

// Date Helper
function getDateString(inDate: Date | string) {
  if (!inDate) return "";
  const d = new Date(inDate);
  const offset = d.getDay();
  const days = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
  const day = days[(offset + 6) % 7];
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${hours}:${mins}`;
}

export default function CaseTable({ initialCases }: { initialCases: any[] }) {
  const [cases, setCases] = useState(initialCases);
  const [activeButton, setActiveButton] = useState("ALL");
  const [error, setError] = useState<string | null>(null);

  const [eventConfig, setEventConfig] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  // Sorting
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getEventConfig();
        setEventConfig(config);
      } catch (err) {
        console.error("Failed to load event config", err);
      }
    };

    fetchConfig();
  }, []);

  // --- FETCHING LOGIC (Using Server Action) ---
  const fetchCases = useCallback(async () => {
    try {
      // Call Server Action directly
      const data = await getFilteredCases(activeButton);
      setCases(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Kunne ikke laste søknader.");
    }
  }, [activeButton]);

  // Polling Effect
  useEffect(() => {
    fetchCases(); // Fetch immediately on filter change
    const interval = setInterval(fetchCases, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchCases]);

  // --- SORTING LOGIC (Client Side) ---
  const sortedCases = useMemo(() => {
    if (!sortColumn) return cases;

    return [...cases].sort((a, b) => {
      // Resolve values (handle nested formReply or linked participant)
      let valA = a.formReply?.[sortColumn];
      let valB = b.formReply?.[sortColumn];

      // Handle special override columns
      if (sortColumn === "name") {
        valA = getDisplayName(a);
        valB = getDisplayName(b);
      }
      if (sortColumn === "participant_id") {
        valA = getDisplayId(a);
        valB = getDisplayId(b);
      }

      if (!valA) return 1;
      if (!valB) return -1;

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [cases, sortColumn, sortDirection]);

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (col: string) => {
    if (sortColumn !== col) return <BiSolidSortAlt className="ml-1 inline" />;
    return sortDirection === "asc" ? (
      <BiSolidDownArrow className="ml-1 inline" />
    ) : (
      <BiSolidUpArrow className="ml-1 inline" />
    );
  };

  if (error)
    return (
      <div className="p-10 text-center text-red-600 font-bold text-xl">
        {error}
      </div>
    );

  return (
    <div className="flex flex-col w-full">
      <h1 className="text-3xl mt-5 md:text-5xl font-bold text-center mb-6">
        Permisjonssøknader
      </h1>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {[
          "ALL",
          "REQUIRE_ACTION",
          "PENDING",
          "APPROVED",
          "REJECTED",
          "EXPIRED",
        ].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveButton(filter)}
            className={`px-4 py-2 rounded transition-colors ${
              activeButton === filter
                ? "bg-blue-600 text-white font-bold"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {filter === "ALL"
              ? "Alle"
              : filter === "REQUIRE_ACTION"
              ? "Krever handling"
              : filter === "PENDING"
              ? "Ikke behandlet"
              : filter === "APPROVED"
              ? "Godkjent"
              : filter === "REJECTED"
              ? "Avvist"
              : "Utgått"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto border">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-eo-lblue sticky top-0">
            <tr>
              <th className="px-3 py-3 text-center">Status</th>
              <th
                className="px-3 py-3 cursor-pointer"
                onClick={() => handleSort("id")}
              >
                ID {renderSortIcon("id")}
              </th>
              <th
                className="px-3 py-3 cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Navn {renderSortIcon("name")}
              </th>
              <th
                className="px-3 py-3 cursor-pointer"
                onClick={() => handleSort("participant_id")}
              >
                Skilt {renderSortIcon("participant_id")}
              </th>
              <th
                className="px-3 py-3 cursor-pointer"
                onClick={() => handleSort("email")}
              >
                E-post {renderSortIcon("email")}
              </th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Fylke</th>
              <th className="px-3 py-3">Fra</th>
              <th className="px-3 py-3">Til</th>
              <th className="px-3 py-3">Årsak</th>
              <th className="px-3 py-3 text-center">Obs?</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedCases.map((c) => (
              <tr
                key={c.id}
                onClick={() => {
                  setSelectedCase(c);
                  setIsDialogOpen(true);
                }}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-3 py-3 flex items-center justify-center">
                  {getStatusSymbol(c)}
                </td>
                <td className="px-3 py-3">{c.id}</td>

                {/* 💡 Use Linked Data if available */}
                <td className="px-3 py-3 font-medium">{getDisplayName(c)}</td>
                <td className="px-3 py-3">{getDisplayId(c)}</td>
                <td className="px-3 py-3 truncate max-w-[150px]">
                  {getDisplayEmail(c)}
                </td>

                <td className="px-3 py-3 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-center text-xs font-semibold ${
                      c.formReply?.type === "DELEGATE"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {c.formReply?.type === "DELEGATE" ? "D" : "O"}
                  </span>
                </td>
                <td className="px-3 py-3">{c.formReply?.county}</td>
                <td className="px-3 py-3">
                  {getDateString(c.formReply?.from)}
                </td>
                <td className="px-3 py-3">
                  {GetParticipantReturning(
                    c.formReply?.to,
                    eventConfig?.endDate || ""
                  )
                    ? getDateString(c.formReply?.to)
                    : "Kommer ikke tilbake"}
                </td>
                <td
                  className="px-3 py-3 truncate max-w-[150px]"
                  title={c.formReply?.reason}
                >
                  {c.formReply?.reason}
                </td>
                <td className="px-3 py-3 text-center">
                  {c.formReply?.has_observer ? (
                    <BiSolidCheckboxChecked className="size-5 mx-auto text-blue-600" />
                  ) : (
                    <BiCheckbox className="size-5 mx-auto text-gray-300" />
                  )}
                </td>
              </tr>
            ))}
            {sortedCases.length === 0 && (
              <tr>
                <td colSpan={11} className="p-10 text-center text-gray-500">
                  Ingen søknader funnet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog */}
      {selectedCase && (
        <CaseDialog
          open={isDialogOpen}
          data={selectedCase}
          onCloseAction={() => {
            setIsDialogOpen(false);
            setSelectedCase(null);
            fetchCases();
          }} // Refresh on close
        />
      )}
    </div>
  );
}
