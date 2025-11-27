"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface ApplicationFormData {
  type: string;
  id: string;
  name: string;
  email: string;
  county: string;
  from_day: string;
  from_time: string;
  to_day: string;
  to_time: string;
  tel: string;
  has_observer: boolean;
  not_returning: boolean;
  reason: string;
  observer_name: string;
  observer_id: string;
  observer_tel: string;
}

export async function submitApplication(data: ApplicationFormData) {
  try {
    const participant = await prisma.participant.findFirst({
      where: {
        email: { equals: data.email, mode: "insensitive" },
      },
      include: { region: true },
    });

    const configEntry = await prisma.config.findUnique({
      where: { key: "START_DATE" },
    });

    if (!configEntry || !configEntry.value) {
      return {
        success: false,
        message: "Systemfeil: Startdato ikke konfigurert.",
      };
    }

    const startDate = new Date(configEntry.value);
    const fromDate = new Date(startDate);
    fromDate.setDate(startDate.getDate() + parseInt(data.from_day));
    const [fromHours, fromMinutes] = data.from_time.split(":").map(Number);
    fromDate.setHours(fromHours, fromMinutes, 0, 0);

    const toDate = new Date(startDate);
    if (data.not_returning) {
      toDate.setDate(startDate.getDate() + 6);
    } else {
      toDate.setDate(startDate.getDate() + parseInt(data.to_day));
      const [toHours, toMinutes] = data.to_time.split(":").map(Number);
      toDate.setHours(toHours, toMinutes, 0, 0);
    }

    // 3. Create FormReply
    const newFormSubmission = await prisma.formReply.create({
      data: {
        name: data.name,
        email: data.email,
        tel: data.tel,
        county: data.county,
        type: data.type as "DELEGATE" | "OBSERVER",
        participant_id: data.id,
        from: fromDate,
        to: toDate,
        reason: data.reason,
        has_observer: data.has_observer,
        observer_name: data.observer_name,
        observer_id: data.observer_id,
        observer_tel: data.observer_tel,
      },
    });

    // 4. Create Case
    await prisma.case.create({
      data: {
        formReply: { connect: { id: newFormSubmission.id } },
        id_swapped: false,
        status: null,
        reason_rejected: "",
        comment: "",
        hmsFlag: false,

        // 💡 Use the secure connection logic determined above
        participant: participant
          ? { connect: { id: participant.id } }
          : undefined,
      },
    });

    revalidatePath("/dashboard/soknader");
    return { success: true };
  } catch (error) {
    console.error("Error submitting application:", error);
    return { success: false, message: "En ukjent feil oppsto ved innsending." };
  }
}

export async function verifyParticipant(email: string, participantId: string) {
  if (!email || !participantId) return null;

  try {
    // Exact match on BOTH fields
    const participant = await prisma.participant.findFirst({
      where: {
        email: { equals: email, mode: "insensitive" }, // Case insensitive email
        participant_id: participantId, // Exact ID match
      },
      include: {
        region: true, // Fetch region name for auto-fill
      },
    });

    if (!participant) return null;

    // Return only safe data needed for the form
    return {
      name: participant.name,
      email: participant.email,
      tel: participant.tel,
      county: participant.region.name,
      id: participant.participant_id,
      type: participant.type,
      // Return the DB ID for linking
      participantObjectId: participant.id,
    };
  } catch (error) {
    console.error("Verification error:", error);
    return null;
  }
}

export async function getEventDuration() {
  try {
    const startEntry = await prisma.config.findUnique({
      where: { key: "START_DATE" },
    });
    const endEntry = await prisma.config.findUnique({
      where: { key: "END_DATE" },
    });

    return {
      start: startEntry?.value,
      end: endEntry?.value,
    };
  } catch (error) {
    console.error("Failed to fetch event duration", error);
    return { start: null, end: null };
  }
}

export async function getRegions() {
  try {
    const regions = await prisma.region.findMany({
      where: { internal: false },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return regions;
  } catch (error) {
    console.error("Failed to fetch regions", error);
    return [];
  }
}
