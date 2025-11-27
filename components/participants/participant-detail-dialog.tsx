"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  BiCalendar,
  BiMap,
  BiHotel,
  BiPhone,
  BiUserCheck,
  BiCheckSquare,
  BiBuilding,
  BiUser,
  BiPencil, // Use pencil icon for editing
  BiCommentDetail,
  BiSolidPlaneLand,
  BiSolidPlaneTakeOff,
} from "react-icons/bi";
import React, { JSX } from "react";

interface ParticipantDetailDialogProps {
  open: boolean;
  onCloseAction: () => void;
  participant: any;
  canWrite: boolean;
}

const ParticipantTypeOptions = {
  DELEGATE: "Delegat",
  OBSERVER: "Observatør",
};

// --- HELPER COMPONENT 1: Renders a single icon + label + value row ---
interface DetailItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number | JSX.Element;
  className?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({
  icon: Icon,
  label,
  value,
  className,
}) => (
  <div className={`flex items-start gap-2 ${className}`}>
    <Icon className="size-5 text-gray-500 flex-shrink-0 mt-0.5" />
    <div className="text-sm">
      <span className="font-medium text-gray-700">{label}:</span>{" "}
      <span className="text-gray-900 break-words">{value}</span>
    </div>
  </div>
);

// --- HELPER COMPONENT 2: Renders dynamic status/type badges ---
interface StatusBadgeProps {
  type: "type" | "checkin" | "docs";
  participant: any;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ type, participant }) => {
  let status: boolean;
  let text: string;
  let style: string;

  if (type === "type") {
    const isDelegate = participant.type === "DELEGATE";
    text =
      ParticipantTypeOptions[
        participant.type as keyof typeof ParticipantTypeOptions
      ];
    style = isDelegate
      ? `bg-indigo-100 text-indigo-800`
      : `bg-yellow-100 text-yellow-800`;
  } else if (type === "checkin") {
    status = participant.checked_in;
    text = status ? "Innsjekket" : "Ikke Innsjekket";
    style = status ? `bg-green-100 text-green-800` : `bg-red-100 text-red-800`;
  } else {
    // Docs
    status = participant.docs_approved_twice;
    text = status
      ? "Fullt Godkjent"
      : participant.docs_approved_once
      ? "Første Godkjent"
      : "Mangler Dokumenter";
    style = status ? `bg-green-100 text-green-800` : `bg-red-100 text-red-800`;
  }

  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${style}`}>
      {text}
    </span>
  );
};
// --- END HELPERS ---

export default function ParticipantDetailDialog({
  open,
  onCloseAction,
  participant,
  canWrite,
}: ParticipantDetailDialogProps) {
  // Helper to display a clean date from a DateTime object
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "Ikke oppgitt";
    return new Date(date).toLocaleDateString("no-NO");
  };

  // Helper to handle participant ID display logic
  const displayParticipantId =
    participant.participant_id && participant.participant_id !== "undefined"
      ? participant.participant_id
      : "Ikke tildelt";

  return (
    <Dialog open={open} onClose={onCloseAction} className="relative z-[90]">
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl bg-white p-6">
          {/* TITLE & ID */}
          <DialogTitle className="text-2xl font-bold border-b pb-2 flex justify-between items-center">
            {participant.name}{" "}
            <span className="text-lg font-normal text-gray-500">
              ({displayParticipantId})
            </span>
          </DialogTitle>

          {/* MAIN GRID CONTENT */}
          <div className="grid md:grid-cols-3 gap-6 pt-4">
            {/* --- COLUMN 1: BASIC/CONTACT --- */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">
                Grunnleggende Info
              </h3>

              <DetailItem
                icon={BiUser}
                label="Type"
                value={<StatusBadge type="type" participant={participant} />}
              />
              <DetailItem
                icon={BiCalendar}
                label="Fødselsdato"
                value={formatDate(participant.dob)}
              />
              <DetailItem
                icon={BiBuilding}
                label="Organisasjon"
                value={participant.organization.name}
              />
              <DetailItem
                icon={BiMap}
                label="Region"
                value={participant.region.name}
              />
              <DetailItem
                icon={BiPhone}
                label="Mobilnummer"
                value={participant.tel}
              />
              <DetailItem
                icon={BiUserCheck}
                label="Innsjekking"
                value={<StatusBadge type="checkin" participant={participant} />}
              />
            </div>

            {/* --- COLUMN 2: HEALTH & EMERGENCY --- */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">
                Helse & Nødkontakt
              </h3>

              <DetailItem
                icon={BiCommentDetail}
                label="Kostspesifikasjon"
                value={participant.mealPreference || "Ingen"}
              />
              <DetailItem
                icon={BiCommentDetail}
                label="Allergi/Annet"
                value={participant.allergy || "Ingen"}
              />

              {/* PÅRØRENDE CONTACT */}
              <div className="pt-2">
                <h4 className="font-medium text-gray-700">
                  Pårørende ({participant.family_relation})
                </h4>
                <p className="ml-3 text-sm">
                  {participant.family}
                  <br />
                  Tlf: {participant.family_tel}
                </p>
              </div>

              {/* SKOLE KONTAKT */}
              <div className="pt-2">
                <h4 className="font-medium text-gray-700">
                  Skolekontakt ({participant.school_contact_relation})
                </h4>
                <p className="ml-3 text-sm">
                  {participant.school_contact}
                  <br />
                  Tlf: {participant.school_contact_tel}
                </p>
              </div>
            </div>

            {/* --- COLUMN 3: LOGISTICS/ADMIN --- */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">
                Logistikk & Admin
              </h3>

              <DetailItem
                icon={BiHotel}
                label="Hotell / Rom"
                value={`${participant.hotel || "N/A"} (Rom: ${
                  participant.room_number || "N/A"
                })`}
              />
              <DetailItem
                icon={BiSolidPlaneLand}
                label="Ankomst"
                value={participant.arrival || "N/A"}
              />
              <DetailItem
                icon={BiSolidPlaneTakeOff}
                label="Avgang"
                value={participant.departure || "N/A"}
              />
              <DetailItem
                icon={BiCheckSquare}
                label="Dok. Status"
                value={<StatusBadge type="docs" participant={participant} />}
              />
              <DetailItem
                icon={BiPencil}
                label="Tidligere Elevting"
                value={participant.previousConferences}
              />

              {participant.notes && (
                <div className="pt-2 border-t mt-3">
                  <p className="font-medium text-sm text-gray-700">Notater:</p>
                  <p className="italic text-sm text-gray-600">
                    {participant.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* --- FOOTER --- */}
          <div className="mt-6 pt-4 border-t flex justify-end">
            {canWrite && (
              <button
                // Placeholder for openEditModal
                className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 flex items-center gap-2"
              >
                <BiPencil /> Rediger Deltaker
              </button>
            )}
            <button
              onClick={onCloseAction}
              className="ml-3 bg-gray-200 text-gray-700 rounded px-4 py-2 hover:bg-gray-300"
            >
              Lukk
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
