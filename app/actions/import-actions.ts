"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import * as XLSX from "xlsx";
import { parse } from "date-fns"; // 💡 Added date-fns for robust date parsing

// --- HELPER FUNCTIONS ---

async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function checkImportAuth() {
  const session = await auth();
  const permissions = session?.user?.permissions || [];
  if (!permissions.includes("users:write")) {
    throw new Error("Unauthorized: Missing import permission.");
  }
}

function sanitizeGender(input: string): "MALE" | "FEMALE" | "OTHER" {
  const lower = input.toLowerCase().trim();
  if (lower.startsWith("mann") || lower.startsWith("male")) return "MALE";
  if (lower.startsWith("kvinne") || lower.startsWith("female")) return "FEMALE";
  return "OTHER";
}

function sanitizeType(input: string): "DELEGATE" | "OBSERVER" {
  const lower = input.toLowerCase().trim();
  if (lower.startsWith("delegat")) return "DELEGATE";
  return "OBSERVER";
}

// Helper to convert Norwegian 'Ja'/'Nei' or '1'/'0' to Boolean
function sanitizeBoolean(input: any): boolean {
  if (typeof input === "number") return input === 1;
  const lower = String(input).toLowerCase().trim();
  return lower === "ja" || lower === "yes" || lower === "true";
}

// Helper to parse a single comma-separated contact string (e.g., "John Doe, Sjef, 11223344")
function parseSingleContactDetails(
  contactData: string
): { name: string; relation: string; tel: string } | null {
  if (!contactData) return null;

  const parts = contactData.split(",").map((p) => p.trim());

  // Ensure we have at least Name and Tel/Relation (assuming Name and Relation are essential)
  if (parts.length < 3) {
    // If we don't have enough parts, but have a name, try to use defaults
    if (parts[0]) {
      return {
        name: parts[0],
        relation: parts[1] || "Pårørende", // Use a default relation if missing
        tel: parts[2] ? parts[2].replace(/\D/g, "").slice(0, 8) : "00000000",
      };
    }
    return null;
  }

  return {
    name: parts[0],
    relation: parts[1],
    tel: parts[2].replace(/\D/g, "").slice(0, 8),
  };
}

// 💡 NEW MAIN PARSER: Separates Family (before ;) and School (after ;)
function parseAllContacts(contactString: string): {
  family: { name: string; relation: string; tel: string } | null;
  school: { name: string; relation: string; tel: string } | null;
} {
  if (!contactString) return { family: null, school: null };

  const parts = contactString.split(";");
  const familyData = parts[0] ? parts[0].trim() : "";
  const schoolData = parts[1] ? parts[1].trim() : "";

  const familyContact = parseSingleContactDetails(familyData);
  const schoolContact = parseSingleContactDetails(schoolData);

  return {
    family: familyContact,
    school: schoolContact,
  };
}

// --- MAIN SERVER ACTION ---

export async function importParticipants(formData: FormData) {
  await checkImportAuth();

  const file = formData.get("excelFile") as File;
  if (!file || file.size === 0) {
    return { success: false, message: "Ingen fil valgt." };
  }

  try {
    const buffer = await fileToBuffer(file);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Use header row to map complex headers: header: 1 means first row is headers
    const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const headers = jsonRows[0] as string[];
    const dataRows = jsonRows.slice(1) as any[][];

    // Find the column index for the complex fields
    const headerMap = headers.reduce((acc, header, index) => {
      acc[header.trim()] = index;
      return acc;
    }, {} as Record<string, number>);

    let createdCount = 0;
    let skippedCount = 0;

    for (const data of dataRows) {
      // Map and sanitize essential Norwegian headers
      const email = data[headerMap["E-postadresse"]]
        ? String(data[headerMap["E-postadresse"]]).toLowerCase().trim()
        : null;
      const regionName = data[headerMap["Region"]]
        ? String(data[headerMap["Region"]]).trim()
        : null;
      const orgName = data[headerMap["Organisasjon"]]
        ? String(data[headerMap["Organisasjon"]]).trim()
        : null;

      // --- CRITICAL DATA VALIDATION ---
      if (
        !email ||
        !regionName ||
        !orgName ||
        !data[headerMap["Fødselsdato"]]
      ) {
        skippedCount++;
        continue;
      }

      // --- COMPLEX FIELD PARSING ---

      // DOB Parsing: Expects dd.mm.yyyy format
      let dobDate: Date;
      try {
        // Use date-fns to robustly parse the dd.mm.yyyy string
        dobDate = parse(
          String(data[headerMap["Fødselsdato"]]),
          "dd.MM.yyyy",
          new Date()
        );
        if (isNaN(dobDate.getTime())) throw new Error("Invalid date");
      } catch {
        console.warn(`Skipping ${email}: Invalid date format for DOB.`);
        skippedCount++;
        continue;
      }

      const contactStrings = String(data[headerMap["Pårørende"]] || "");
      const { family: familyContact, school: schoolContact } =
        parseAllContacts(contactStrings);

      // --- CRITICAL CHECK FOR FAMILY CONTACT (MANDATORY IN SCHEMA) ---
      if (!familyContact) {
        console.warn(
          `Skipping ${email}: Missing critical Pårørende (Family) data.`
        );
        skippedCount++;
        continue;
      }

      // Default school contact data if the second part of the string was empty
      const schoolName = schoolContact?.name || "Ukjent";
      const schoolRelation = schoolContact?.relation || "Skolekontakt";
      const schoolTel = schoolContact?.tel || "00000000";

      // --- RELATION LOOKUPS ---

      // 1. Get or Create Region
      const region = await prisma.region.upsert({
        where: { name: regionName },
        update: {},
        create: { name: regionName },
      });

      // 2. Get or Create Organization
      const organization = await prisma.organization.upsert({
        where: { name: orgName },
        update: { regionId: region.id },
        create: {
          name: orgName,
          regionId: region.id,
          canVote: sanitizeBoolean(data[headerMap["Status"]] || true), // Use Status as a proxy or assume vote status
        },
      });

      // 3. Create Participant
      try {
        await prisma.participant.upsert({
          where: { email: email },
          update: {
            name: data[headerMap["Navn"]],
            tel: String(data[headerMap["Mobilnummer"]] || ""),
            participant_id: data[headerMap["Skiltnummer"]]
              ? String(data[headerMap["Skiltnummer"]])
              : null,
            gender: sanitizeGender(data[headerMap["Kjønn"]] || "OTHER"),
            type: sanitizeType(data[headerMap["Status"]] || "OBSERVER"),

            // NEW MANDATORY FIELDS
            dob: dobDate,
            family: familyContact.name,
            family_relation: familyContact.relation,
            family_tel: familyContact.tel,
            school_contact: schoolName,
            school_contact_relation: schoolRelation,
            school_contact_tel: schoolTel,

            // NEW OPTIONAL FIELDS (Direct mapping from spreadsheet)
            mealPreference: data[headerMap["Kostspesifikasoner"]] || null,
            allergy: data[headerMap["Hyperallergi eller lignende"]] || null,
            hotel: data[headerMap["Hotell"]] || null,
            arrival: data[headerMap["Ankomst"]] || null,
            departure: data[headerMap["Avgang"]] || null,

            // NEW COMPLEX/BOOLEAN FIELDS
            previousConferences:
              parseInt(
                data[headerMap["Antall Elevting deltatt på tidligere"]] || "0"
              ) || 0,
            elected_representative: sanitizeBoolean(
              data[headerMap["Tillittsvalgt"]]
            ),
            docs_approved_once: sanitizeBoolean(
              data[headerMap["Dokumenter godkjent første gang"]]
            ),
            docs_approved_twice: sanitizeBoolean(
              data[headerMap["Dokumenter godkjent andre gang"]]
            ),
            room_number: data[headerMap["Romnummer"]] || null,
            notes: data[headerMap["Notater"]] || null,
            checked_in: sanitizeBoolean(data[headerMap["Sjekket inn"]]),

            // RELATIONS
            regionId: region.id,
            organizationId: organization.id,
          },
          create: {
            email: email, // Required for upsert, placed outside update for clarity
            name: data[headerMap["Navn"]],
            tel: String(data[headerMap["Mobilnummer"]] || ""),
            participant_id: String(data[headerMap["Skiltnummer"]]),
            gender: sanitizeGender(data[headerMap["Kjønn"]] || "OTHER"),
            type: sanitizeType(data[headerMap["Status"]] || "OBSERVER"),

            dob: dobDate,
            // 💡 FAMILY CONTACT FIELDS
            family: familyContact.name,
            family_relation: familyContact.relation,
            family_tel: familyContact.tel,

            // 💡 SCHOOL CONTACT FIELDS
            school_contact: schoolName,
            school_contact_relation: schoolRelation,
            school_contact_tel: schoolTel,

            mealPreference: data[headerMap["Kostspesifikasoner"]] || null,
            allergy: data[headerMap["Hyperallergi eller lignende"]] || null,
            hotel: data[headerMap["Hotell"]] || null,
            arrival: data[headerMap["Ankomst"]] || null,
            departure: data[headerMap["Avgang"]] || null,

            previousConferences:
              parseInt(
                data[headerMap["Antall Elevting deltatt på tidligere"]] || "0"
              ) || 0,
            elected_representative: sanitizeBoolean(
              data[headerMap["Tillittsvalgt"]]
            ),
            docs_approved_once: sanitizeBoolean(
              data[headerMap["Dokumenter godkjent første gang"]]
            ),
            docs_approved_twice: sanitizeBoolean(
              data[headerMap["Dokumenter godkjent andre gang"]]
            ),
            room_number: data[headerMap["Romnummer"]] || null,
            notes: data[headerMap["Notater"]] || null,
            checked_in: sanitizeBoolean(data[headerMap["Sjekket inn"]]),

            regionId: region.id,
            organizationId: organization.id,
          },
        });
        createdCount++;
      } catch (e: any) {
        // Log individual user creation errors (e.g., data too long or relation fail)
        console.error(`Error creating participant ${email}:`, e.message || e);
        skippedCount++;
      }
    }

    revalidatePath("/dashboard/participants");
    return {
      success: true,
      message: `Importering fullført. Opprettet/Oppdatert: ${createdCount}, Hoppet over: ${skippedCount}`,
    };
  } catch (error: any) {
    console.error("Critical Import Error:", error);
    return {
      success: false,
      message: `Kritisk feil under parsing: ${error.message}`,
    };
  }
}
