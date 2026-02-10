"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

async function checkHmsWriteAuth() {
  const session = await auth();

  // 1. Authentication Check: If the user is not logged in, throw error.
  if (!session || !session.user || !session.user.email) {
    // Throw a generic Unauthorized error that can be caught by the calling function.
    throw new Error("Unauthorized: User not logged in.");
  }

  // Use the non-null user object safely from here.
  const permissions = session.user.permissions || [];

  // 2. Authorization Check: Check for specific permission.
  if (!permissions.includes("hse:write")) {
    throw new Error("Unauthorized: Missing 'hse:write' permission.");
  }

  // Return the email, now safely guaranteed to exist.
  return session.user.email;
}

export async function submitHmsIncident(formData: FormData) {
  const reporterEmail = await checkHmsWriteAuth();

  const incidentType = formData.get("incidentType") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;

  // 💡 FIX: Retrieve and parse the ID carefully
  const participantObjectIdRaw = formData.get("participantObjectId");
  let participantObjectId: number | null = null;

  if (
    participantObjectIdRaw &&
    participantObjectIdRaw !== "null" &&
    participantObjectIdRaw !== "undefined"
  ) {
    const parsed = parseInt(participantObjectIdRaw.toString(), 10);
    if (!isNaN(parsed)) {
      participantObjectId = parsed;
    }
  }

  if (!incidentType || !description) {
    return {
      success: false,
      message: "Type og beskrivelse er påkrevd.",
    };
  }

  if (!participantObjectId) {
    return { success: false, message: "Deltaker er påkrevd." };
  }

  try {
    const reporter = await prisma.whitelist.findUnique({
      where: { email: reporterEmail },
    });
    if (!reporter) {
      throw new Error("Reporter not found in whitelist.");
    }

    // 2. Create the HMS Incident
    await prisma.hMS.create({
      data: {
        incidentType: incidentType as
          | "ILLNESS"
          | "ACCIDENT"
          | "ALLERGY"
          | "OTHER",
        description: description,
        location: location || null,

        // 💡 FIX: Use the safely parsed ID
        participantObjectId: participantObjectId,

        // Explicitly null out the legacy fields if they are not used
        participantId: null,
        participantName: null,

        reportedById: reporter.id,
      },
    });

    revalidatePath("/hjem/hms/report"); // Ensure cache is cleared
    return { success: true };
  } catch (error) {
    console.error("Error submitting HMS incident:", error);
    return { success: false, message: "Failed to submit incident." };
  }
}

export async function getAllHmsIncidents() {
  const session = await auth();
  const permissions = session?.user?.permissions || [];
  if (!permissions.includes("hse:read")) return [];

  try {
    const incidents = await prisma.hMS.findMany({
      include: {
        reportedBy: { select: { email: true } },
        participantObject: { select: { name: true, participant_id: true } },
        // 💡 NEW: Fetch the linked case and its dates
        case: {
          include: {
            formReply: {
              select: { from: true, to: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return incidents;
  } catch (error) {
    console.error("Error fetching HMS incidents:", error);
    return [];
  }
}

export async function addHmsAction(incidentId: number, actionText: string) {
  const reporterEmail = await checkHmsWriteAuth();

  const reporter = await prisma.whitelist.findUnique({
    where: { email: reporterEmail },
  });

  if (!reporter) {
    throw new Error("Reporter not found.");
  }

  await prisma.hMS_actions.create({
    data: {
      hmsIncidentId: incidentId,
      userId: reporter.id,
      action: actionText,
    },
  });

  // You must revalidate the path to force the dashboard/dialog to refresh
  revalidatePath("/hjem/hms/report");
}

export async function deleteHmsIncident(incidentId: number) {
  await checkHmsWriteAuth();

  // Delete actions first, as they depend on the incident (cascading delete not set up)
  await prisma.hMS_actions.deleteMany({
    where: { hmsIncidentId: incidentId },
  });

  // Delete the incident
  await prisma.hMS.delete({
    where: { id: incidentId },
  });

  revalidatePath("/hjem/hms/report");
}

export async function getHmsActionsByIncident(hmsIncidentId: number) {
  const session = await auth();
  const permissions = session?.user?.permissions || [];

  // Security check: If they can't read HSE events, they shouldn't read the actions either.
  if (!permissions.includes("hse:read")) {
    return []; // Return empty array silently if unauthorized
  }

  try {
    const actions = await prisma.hMS_actions.findMany({
      where: { hmsIncidentId },
      include: {
        user: { select: { email: true } }, // Include the user who logged the action
      },
      orderBy: { timestamp: "asc" },
    });
    // Convert date objects to strings for safe client-side hydration
    return actions.map((action) => ({
      ...action,
      timestamp: action.timestamp.toISOString(), // Ensure dates are stable strings
    }));
  } catch (error) {
    console.error(
      `Error fetching HMS actions for incident ${hmsIncidentId}:`,
      error,
    );
    return [];
  }
}
export async function updateHmsIncidentDetails(
  incidentId: number,
  details: {
    incidentType: string;
    description: string;
    location: string;
    // The following two are legacy/display fields, but are required by the client object:
    participantId: string | null;
    participantName: string | null;
    // 🚨 ADD THIS NEW FOREIGN KEY FIELD:
    participantObjectId: number | null;
  },
) {
  await checkHmsWriteAuth();

  try {
    await prisma.hMS.update({
      where: { id: incidentId },
      data: {
        incidentType: details.incidentType as
          | "ILLNESS"
          | "ACCIDENT"
          | "ALLERGY"
          | "OTHER",
        description: details.description,
        location: details.location,

        // 💡 Use the new object ID for the relation:
        participantObjectId: details.participantObjectId,

        // Keep these for display compatibility/legacy tracking if needed
        participantId: details.participantId,
        participantName: details.participantName,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating incident details:", error);
    throw new Error("Failed to update incident details.");
  }
}

export async function searchParticipants(query: string) {
  const isNumeric = /^\d+$/.test(query);
  if (!isNumeric && query.length < 3) {
    return [];
  }

  // We only need read access to the general participant list
  // A full check is omitted here as the parent page is already protected by hse:read,
  // but the query should be secure (i.e., not leaking data externally).

  try {
    const participants = await prisma.participant.findMany({
      where: {
        OR: [
          // Search by name (case insensitive)
          { name: { contains: query, mode: "insensitive" } },
          // Search by participant_id (exact or partial match)
          { participant_id: { startsWith: query } },
        ],
      },
      // Limit results for performance and include essential info
      select: {
        id: true,
        name: true,
        participant_id: true,
        email: true,
      },
      take: 10,
    });

    return participants.map((p) => ({
      id: p.id,
      label: `${p.name} (${p.participant_id || p.email})`, // Display format
      name: p.name,
      participantId: p.participant_id,
    }));
  } catch (error) {
    console.error("Participant search failed:", error);
    return [];
  }
}

export async function createHmsMedicalLeave(
  hmsIncidentId: number,
  participantObjectId: number,
  from: Date,
  to: Date,
) {
  await checkHmsWriteAuth();

  try {
    // 1. Get Participant details for the FormReply snapshot
    const participant = await prisma.participant.findUnique({
      where: { id: participantObjectId },
      include: { region: true },
    });

    if (!participant) throw new Error("Deltaker ikke funnet.");

    // 2. Create FormReply
    const formReply = await prisma.formReply.create({
      data: {
        name: participant.name,
        email: participant.email,
        tel: participant.tel,
        county: participant.region.name,
        type: participant.type,
        participant_id: participant.participant_id || "",
        from: from,
        to: to,
        reason: "Medisinsk Permisjon (HMS)",
        // Defaults
        has_observer: false,
      },
    });

    // 3. Create Case linked to HMS and Participant
    await prisma.case.create({
      data: {
        formReplyId: formReply.id,
        hmsIncidentId: hmsIncidentId,
        participantObjectId: participant.id,
        hmsFlag: true, // Important for KK to see
        id_swapped: false,
        status: true, // 💡 Auto-approve medical leave? Or set to null for review?
        // Usually HMS leave is effective immediately, so true might be best.
        // If it needs KK approval, set to null.
      },
    });

    revalidatePath("/hjem/hms/report");
    return { success: true };
  } catch (error) {
    console.error("Create Leave Error:", error);
    return { success: false, message: "Kunne ikke opprette permisjon." };
  }
}

// 💡 NEW: Update existing Medical Leave dates
export async function updateHmsMedicalLeave(
  caseId: number,
  from: Date,
  to: Date,
) {
  await checkHmsWriteAuth();

  try {
    // Find the FormReply ID connected to this case
    const caseItem = await prisma.case.findUnique({
      where: { id: caseId },
      select: { formReplyId: true },
    });

    if (!caseItem) throw new Error("Sak ikke funnet.");

    // Update the dates
    await prisma.formReply.update({
      where: { id: caseItem.formReplyId },
      data: { from, to },
    });

    revalidatePath("/hjem/hms/report");
    return { success: true };
  } catch (error) {
    console.error("Update Leave Error:", error);
    return { success: false, message: "Kunne ikke oppdatere permisjon." };
  }
}
