import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  BiArrowBack,
  BiBuilding,
  BiMap,
  BiPhone,
  BiUser,
  BiCheckSquare,
  BiHotel,
  BiCommentDetail,
  BiFirstAid,
  BiEnvelope,
  BiCake,
  BiMaleFemale,
  BiCalendar,
  BiLock,
} from "react-icons/bi";
import GetGender from "@/components/ts/get-gender";
import ParticipantHmsHistory from "@/components/participants/participant-hms-history";
import ParticipantAbsenceHistory from "@/components/participants/participant-absence-history";
import { Metadata } from "next";
import { cache } from "react";
import getUserPermissions from "@/components/ts/get-user-permissions";

interface PageParams {
  conferenceId: string;
  slug: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { conferenceId, slug } = await params;
  const result = await getParticipantData(conferenceId, slug);

  if (!result || result === "UNAUTHORIZED" || !result.participant) {
    return { title: "Deltaker" };
  }

  return {
    title: `${result.participant.name} - ${conferenceId}`,
    description: "Detaljert visning av deltaker",
  };
}

// --- Helper for Date Formatting ---
const formatDate = (date: Date | null | undefined) => {
  if (!date) return "Ikke oppgitt";
  return new Date(date).toLocaleDateString("no-NO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// --- 1. DATA FETCHING & SECURITY LOGIC ---
async function getParticipantData(
  conferenceShortName: string,
  participantSlug: string,
) {
  const participantId = parseInt(participantSlug, 10);
  if (isNaN(participantId)) return null;

  const session = await auth();
  if (!session?.user?.email) return "UNAUTHORIZED";

  // 1. Resolve Conference ID
  // We need the numeric ID of the conference to ensure the participant belongs to it
  const conference = await prisma.conference.findUnique({
    where: { shortname: conferenceShortName }, // Assuming 'id' is the shortname based on previous context
    select: { id: true },
  });

  if (!conference) return null;

  // 2. Fetch User Permissions & Region
  const currentUser = await prisma.whitelist.findUnique({
    where: { email: session.user.email },
    select: { regionId: true },
  });

  const permissions = getUserPermissions(conferenceShortName, session.user);
  const hasGlobalRead = permissions.includes("participant:read");
  const hasRegionalRead = permissions.includes("participant:regional_read");

  if (!hasGlobalRead && !hasRegionalRead) {
    return "UNAUTHORIZED";
  }

  const canViewHms = permissions.includes("hse:read");
  const canViewCases = permissions.includes("case:read");

  // 3. Fetch the PARTICIPANT
  const data = await getParticipant(participantId, canViewHms, canViewCases);

  if (!data) return null;

  // 4. CONTEXT CHECK: Ensure participant belongs to this conference
  if (data.conferenceId !== conference.id) {
    return null; // Participant exists, but not in this conference
  }

  // 5. REGIONAL SECURITY CHECK
  if (!hasGlobalRead) {
    if (!currentUser?.regionId || currentUser.regionId !== data.regionId) {
      return "UNAUTHORIZED";
    }
  }

  return {
    participant: data,
    permissions: {
      canWriteHse: permissions.includes("hse:write"),
      canReadHse: permissions.includes("hse:read"),
      canDeleteHse: permissions.includes("hse:delete"),
      canWriteCases: permissions.includes("case:write"),
      canReadCases: permissions.includes("case:read"),
    },
  };
}

// Cached fetcher for Participant Data
const getParticipant = cache(
  async (
    id: number,
    canViewHms: boolean = false,
    canViewCases: boolean = false,
  ) => {
    return await prisma.participant.findUnique({
      where: { id },
      include: {
        region: true,
        organization: true,

        // 💡 SECURE FETCH: HMS
        hms: canViewHms
          ? {
              orderBy: { createdAt: "desc" },
              include: {
                reportedBy: { select: { email: true } },
              },
            }
          : false,

        // 💡 SECURE FETCH: Cases (Absence)
        cases: canViewCases
          ? {
              orderBy: { id: "desc" },
              include: {
                formReply: true,
                participant: true,
              },
            }
          : false,
      },
    });
  },
);

// --- The Page Component ---
export default async function ParticipantDetailsPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { conferenceId, slug } = await params;

  const result = await getParticipantData(conferenceId, slug);

  if (result === "UNAUTHORIZED") redirect("/unauthorized");
  if (!result || !result.participant) notFound();

  const { participant, permissions } = result;

  // 4. Render UI
  return (
    <div className="flex md:flex-row">
      <div className="p-8 max-w-7xl mx-auto w-full">
        {/* Header / Back Button */}
        <div className="mb-6">
          <Link
            href={`/hjem/${conferenceId}/deltakere`} // 👈 Context-aware back link
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <BiArrowBack className="mr-2" /> Tilbake til oversikt
          </Link>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {participant.name}
              </h1>
              <p className="text-gray-500 text-lg">
                {participant.participant_id
                  ? `Skiltnr: ${participant.participant_id}`
                  : "Mangler skiltnummer"}
              </p>
            </div>
            <div className="flex gap-2">
              {/* Status Badges */}
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  participant.type === "DELEGATE"
                    ? "bg-indigo-100 text-indigo-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {participant.type === "DELEGATE" ? "Delegat" : "Observatør"}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  participant.checked_in
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {participant.checked_in ? "Innsjekket" : "Ikke innsjekket"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
          {/* --- COL 1: BASIC INFO --- */}
          <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
            <h2 className="text-lg font-bold border-b pb-2 mb-4 flex items-center gap-2">
              <BiUser className="text-gray-400" /> Personalia & Tilhørighet
            </h2>

            <InfoRow
              icon={BiEnvelope}
              label="E-post"
              href={`mailto:` + participant.email}
              value={participant.email}
            />
            <InfoRow
              icon={BiPhone}
              label="Telefon"
              href={`tel:` + participant.tel}
              value={participant.tel}
            />
            <InfoRow
              icon={BiCake}
              label="Fødselsdato"
              value={formatDate(participant.dob)}
            />
            <InfoRow
              icon={BiMaleFemale}
              label="Kjønn"
              value={GetGender(participant.gender)}
            />
            <div className="border-t pt-2 mt-2"></div>
            <InfoRow
              icon={BiBuilding}
              label="Organisasjon"
              value={participant.organization.name}
            />
            <InfoRow
              icon={BiMap}
              label="Region"
              value={participant.region.name}
            />
          </div>

          {/* --- COL 2: HEALTH & EMERGENCY --- */}
          <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
            <h2 className="text-lg font-bold border-b pb-2 mb-4 flex items-center gap-2">
              <BiFirstAid className="text-gray-400" /> Helse & Nødkontakt
            </h2>

            {permissions.canReadHse ? (
              <div className="space-y-4">
                <InfoRow
                  label="Kosthensyn"
                  value={participant.mealPreference}
                  placeholder="Ingen"
                />
                <InfoRow
                  label="Allergier"
                  value={participant.allergy}
                  placeholder="Ingen"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-lg text-gray-500 p-3">
                <BiLock className="text-xl shrink-0" />
                <span className="text-sm">
                  Du har ikke tilgang til å se disse opplysningene.
                </span>
              </div>
            )}

            <div className="bg-gray-50 p-3 rounded-lg mt-4">
              <h3 className="font-semibold text-gray-700 text-sm mb-2">
                Pårørende ({participant.family_relation})
              </h3>
              <p className="text-gray-900">{participant.family}</p>
              <a
                href={`tel:${participant.family_tel}`}
                className="text-blue-600 text-sm hover:underline"
              >
                {participant.family_tel}
              </a>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="font-semibold text-gray-700 text-sm mb-2">
                Skolekontakt ({participant.school_contact_relation})
              </h3>
              <p className="text-gray-900">{participant.school_contact}</p>
              <a
                href={`tel:${participant.school_contact_tel}`}
                className="text-blue-600 text-sm hover:underline"
              >
                {participant.school_contact_tel}
              </a>
            </div>
          </div>

          {/* --- COL 3: LOGISTICS --- */}
          <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
            <h2 className="text-lg font-bold border-b pb-2 mb-4 flex items-center gap-2">
              <BiHotel className="text-gray-400" /> Logistikk & Status
            </h2>

            <InfoRow
              label="Hotell"
              value={participant.hotel}
              placeholder="Ikke tildelt"
            />
            <InfoRow
              label="Romnummer"
              value={participant.room_number}
              placeholder="-"
            />
            <InfoRow
              icon={BiCalendar}
              label="Ankomst"
              value={participant.arrival}
              placeholder="-"
            />
            <InfoRow
              icon={BiCalendar}
              label="Avgang"
              value={participant.departure}
              placeholder="-"
            />

            <div className="border-t pt-2 mt-2"></div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <BiCheckSquare /> Dok. 1. gang
              </span>
              <StatusDot active={participant.docs_approved_once} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <BiCheckSquare /> Dok. 2. gang
              </span>
              <StatusDot active={participant.docs_approved_twice} />
            </div>

            {participant.notes && (
              <div className="mt-4 bg-yellow-50 p-3 rounded border border-yellow-100">
                <div className="flex items-center gap-2 text-yellow-800 font-semibold text-xs mb-1">
                  <BiCommentDetail /> Notater
                </div>
                <p className="text-sm text-gray-800 italic">
                  {participant.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* --- SECTION 4: ABSENCE HISTORY (PROTECTED) --- */}
        {permissions.canReadCases &&
          participant.cases &&
          participant.cases.length > 0 && (
            <div className="mt-8 border-t pt-8">
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
                <ParticipantAbsenceHistory
                  cases={participant.cases}
                  canWrite={permissions.canWriteCases}
                />
              </div>
            </div>
          )}

        {/* --- SECTION 5: HMS HISTORY (PROTECTED) --- */}
        {permissions.canReadHse &&
          participant.hms &&
          participant.hms.length > 0 && (
            <div className="mt-8 border-t pt-8">
              <div className="bg-red-50 border border-red-100 p-6 rounded-xl">
                <ParticipantHmsHistory
                  incidents={participant.hms}
                  canWrite={permissions.canWriteHse}
                  canDelete={permissions.canDeleteHse}
                  participantId={participant.id}
                  participantName={participant.name}
                  participantDisplayId={participant.participant_id}
                />
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

// --- Helper Components ---

function InfoRow({
  label,
  value,
  placeholder,
  icon: Icon,
  href,
}: {
  label: string;
  value: string | null | undefined;
  placeholder?: string;
  icon?: any;
  href?: string;
}) {
  const displayValue = value || placeholder || "-";

  return (
    <div className="flex justify-between items-start">
      <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
        {Icon && <Icon className="size-4" />} {label}
      </span>

      <span className="text-sm font-medium text-gray-900 text-right max-w-[200px] break-words">
        {value && href ? (
          <a
            href={href}
            className="text-blue-600 hover:underline transition-colors"
          >
            {displayValue}
          </a>
        ) : (
          displayValue
        )}
      </span>
    </div>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={`px-2 py-0.5 text-xs rounded ${
        active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {active ? "Godkjent" : "Mangler"}
    </span>
  );
}
