"use client";

import { useState } from "react";
import { BiChevronDown, BiChevronUp, BiTimeFive } from "react-icons/bi";
import CaseDialog from "@/components/case-dialog"; // Reusing your existing dialog
import getStatusSymbol from "@/components/status-symbol"; // Reusing your status symbol

interface AbsenceHistoryProps {
  cases: any[]; // CaseWithFormReply[]
  canWrite: boolean; // case:write
}

export default function ParticipantAbsenceHistory({
  cases,
}: AbsenceHistoryProps) {
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Collapsed by default
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRowClick = (c: any) => {
    setSelectedCase(c);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedCase(null);
    // Optional: router.refresh() if you want updates to reflect immediately on the page
  };

  const formatDate = (date: Date | string) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("no-NO", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Header Toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="cursor-pointer flex items-center justify-between mb-4 select-none"
      >
        <div className="flex items-center gap-3">
          <BiTimeFive className="size-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-blue-900">
            Fravær / Permisjoner
          </h2>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
            {cases.length} saker
          </span>
        </div>

        <button className="text-blue-700 hover:bg-blue-50 p-1 rounded-full transition-colors">
          {isExpanded ? (
            <BiChevronUp className="size-6" />
          ) : (
            <BiChevronDown className="size-6" />
          )}
        </button>
      </div>

      {/* Table / Summary */}
      {isExpanded ? (
        <div className="bg-white shadow-sm border rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Til
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Årsak
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cases.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => handleRowClick(c)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusSymbol(c)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(c.formReply?.from)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(c.formReply?.to)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                    {c.formReply?.reason}
                    {c.hmsFlag && (
                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                        HMS
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          onClick={() => setIsExpanded(true)}
          className="text-sm text-blue-800 italic bg-white/50 p-3 rounded border border-blue-100 cursor-pointer hover:bg-blue-50 transition-colors text-center"
        >
          Klikk for å vise {cases.length} permisjonssøknader.
        </div>
      )}

      {/* Reusing Case Dialog */}
      {selectedCase && (
        <CaseDialog
          open={isOpen}
          data={selectedCase}
          onCloseAction={handleClose}
        />
      )}
    </>
  );
}
