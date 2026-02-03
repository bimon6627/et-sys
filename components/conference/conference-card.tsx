"use client";

import {
  BiCalendar,
  BiMap,
  BiUser,
  BiArchiveIn,
  BiTrash,
  BiCheckCircle,
} from "react-icons/bi";
import {
  toggleArchiveConference,
  deleteConference,
} from "@/app/actions/conference-actions";
import Link from "next/link";
import { useState } from "react";

interface ConferenceCardProps {
  conference: any;
  permissions: {
    canWrite: boolean;
    canDelete: boolean;
  };
}

export default function ConferenceCard({
  conference,
  permissions,
}: ConferenceCardProps) {
  const [loading, setLoading] = useState(false);

  const formatDate = (d: Date) => new Date(d).toLocaleDateString("no-NO");

  const handleArchive = async () => {
    if (
      !confirm(
        conference.archived ? "Gjenopprett konferanse?" : "Arkiver konferanse?",
      )
    )
      return;
    setLoading(true);
    await toggleArchiveConference(conference.id, !conference.archived);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Er du HELT sikker? Dette sletter all data knyttet til konferansen!",
      )
    )
      return;
    setLoading(true);
    const res = await deleteConference(conference.id);
    if (!res.success) alert(res.message);
    setLoading(false);
  };

  return (
    <div
      className={`rounded-xl border p-6 shadow-sm transition-all relative overflow-hidden ${
        conference.active
          ? "bg-white border-blue-200 ring-1 ring-blue-100"
          : conference.archived
            ? "bg-gray-50 border-gray-200 opacity-75"
            : "bg-white"
      }`}
    >
      {/* Active Badge */}
      {conference.active && (
        <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          AKTIV
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">{conference.name}</h3>
        <p className="text-sm text-gray-500 font-mono">
          #{conference.shortname}
        </p>
      </div>

      {/* Stats */}
      <div className="space-y-2 text-sm text-gray-600 mb-6">
        <div className="flex items-center gap-2">
          <BiCalendar className="text-gray-400" />
          <span>
            {formatDate(conference.startDate)} -{" "}
            {formatDate(conference.endDate)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <BiMap className="text-gray-400" />
          <span>{conference.region?.name || "Nasjonal / Alle"}</span>
        </div>
        <div className="flex items-center gap-2">
          <BiUser className="text-gray-400" />
          <span>{conference._count?.participants || 0} deltakere</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t">
        <Link
          href={`/dashboard?conf=${conference.id}`}
          className="flex-1 bg-gray-900 text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Gå til Dashboard
        </Link>

        {permissions.canWrite && (
          <button
            onClick={handleArchive}
            disabled={loading}
            title={conference.archived ? "Gjenopprett" : "Arkiver"}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {conference.archived ? (
              <BiCheckCircle size={20} />
            ) : (
              <BiArchiveIn size={20} />
            )}
          </button>
        )}

        {permissions.canDelete && (
          <button
            onClick={handleDelete}
            disabled={loading}
            title="Slett"
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <BiTrash size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
