"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import * as XLSX from "xlsx";
import { parse } from "date-fns";

// --- 1. SECURITY & HELPERS ---

async function checkImportAuth() {
  const session = await auth();
  const permissions = session?.user?.permissions || [];
  if (!permissions.includes("users:write")) {
    throw new Error("Unauthorized: Missing import permission.");
  }
}

function sanitizeGender(input: string): "MALE" | "FEMALE" | "OTHER" {
  const lower = String(input || "")
    .toLowerCase()
    .trim();
  if (lower.startsWith("mann") || lower.startsWith("male")) return "MALE";
  if (lower.startsWith("kvinne") || lower.startsWith("female")) return "FEMALE";
  return "OTHER";
}

function sanitizeType(input: string): "DELEGATE" | "OBSERVER" {
  const lower = String(input || "")
    .toLowerCase()
    .trim();
  if (lower.startsWith("delegat")) return "DELEGATE";
  return "OBSERVER";
}

function sanitizeBoolean(input: any): boolean {
  if (typeof input === "number") return input === 1;
  const lower = String(input || "")
    .toLowerCase()
    .trim();
  return lower === "ja" || lower === "yes" || lower === "true";
}

function parseSingleContactDetails(
  contactData: string,
): { name: string; relation: string; tel: string } | null {
  if (!contactData) return null;

  const parts = contactData.split(",").map((p) => p.trim());

  if (parts.length < 3) {
    if (parts[0]) {
      return {
        name: parts[0],
        relation: parts[1] || "Pårørende",
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

function parseAllContacts(contactString: string): {
  family: { name: string; relation: string; tel: string } | null;
  school: { name: string; relation: string; tel: string } | null;
} {
  if (!contactString) return { family: null, school: null };

  const parts = contactString.split(";");
  const familyData = parts[0] ? parts[0].trim() : "";
  const schoolData = parts[1] ? parts[1].trim() : "";

  return {
    family: parseSingleContactDetails(familyData),
    school: parseSingleContactDetails(schoolData),
  };
}

// --- 2. AUTOMATIC LOGIN / COOKIE SCRAPING ---

// 💡 IMPROVED: Cleans cookies to remove 'Path', 'HttpOnly', etc.
function extractCookies(response: Response) {
  const setCookieHeaders = response.headers.getSetCookie
    ? response.headers.getSetCookie()
    : [response.headers.get("set-cookie") || ""];

  return setCookieHeaders
    .map((cookie) => cookie.split(";")[0]) // Keep only "key=value", drop attributes
    .filter(Boolean)
    .join("; ");
}

function extractCsrfTokenFromHtml(html: string): string | null {
  const match = html.match(
    /<input[^>]*name=["']csrfmiddlewaretoken["'][^>]*value=["']([^"']+)["']/i,
  );
  return match ? match[1] : null;
}

async function refreshLegacySession() {
  console.log("Refreshing Legacy Session...");

  const loginUrl = process.env.LEGACY_LOGIN_URL;
  const username = process.env.LEGACY_USERNAME;
  const password = process.env.LEGACY_PASSWORD;

  if (!loginUrl || !username || !password) {
    throw new Error("Mangler login-info i .env (LEGACY_LOGIN_URL, etc)");
  }

  try {
    // A. Initial GET to fetch CSRF cookie and token
    const initialRes = await fetch(loginUrl, { method: "GET" });
    if (!initialRes.ok) throw new Error("Kunne ikke laste inn login-siden.");

    const initialHtml = await initialRes.text();
    const initialCookies = extractCookies(initialRes);
    const csrfToken = extractCsrfTokenFromHtml(initialHtml);

    if (!csrfToken) {
      throw new Error("Fant ikke csrfmiddlewaretoken i HTML-en.");
    }

    // B. Prepare Login Data
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("csrfmiddlewaretoken", csrfToken);

    // C. Perform Login POST
    const res = await fetch(loginUrl, {
      method: "POST",
      body: formData,
      redirect: "manual", // Handle redirect manually to capture Set-Cookie
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: initialCookies,
        Referer: loginUrl,
        Origin: new URL(loginUrl).origin,
      },
    });

    // D. Capture the new Session Cookie
    const newCookies = extractCookies(res);

    // Combine cookies.
    // Note: If newCookies has a new value for a key in initialCookies, usually simply appending works
    // because servers prioritize the specific order, but splitting and deduplicating is safer.
    // For now, simple concatenation is usually sufficient for session + csrf.
    const combinedCookies = [initialCookies, newCookies]
      .filter(Boolean)
      .join("; ");

    // Validation
    if (!combinedCookies.toLowerCase().includes("sessionid")) {
      console.warn(
        "Warning: 'sessionid' not found in new cookies. Login might have failed.",
      );
    }

    // E. Save to Database
    await prisma.config.upsert({
      where: { key: "LEGACY_SESSION_COOKIE" },
      update: { value: combinedCookies },
      create: { key: "LEGACY_SESSION_COOKIE", value: combinedCookies },
    });

    console.log("New session cookie saved.");
    return combinedCookies;
  } catch (e) {
    console.error("Login request failed:", e);
    throw e;
  }
}

// --- 3. SHARED PARSING LOGIC ---

async function processExcelBuffer(buffer: Buffer) {
  try {
    // Verify buffer isn't HTML
    const startOfFile = buffer.slice(0, 20).toString("utf-8");
    if (
      startOfFile.trim().startsWith("<!DOCTYPE") ||
      startOfFile.trim().startsWith("<html")
    ) {
      throw new Error(
        "Nedlastet fil er en HTML-side (sannsynligvis en feilside eller login-side), ikke en Excel-fil.",
      );
    }

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const headers = jsonRows[0] as string[];
    const dataRows = jsonRows.slice(1) as any[][];

    // Map headers to indices
    const headerMap = headers.reduce(
      (acc, header, index) => {
        acc[header.trim()] = index;
        return acc;
      },
      {} as Record<string, number>,
    );

    let createdCount = 0;
    let skippedCount = 0;

    for (const data of dataRows) {
      // Basic Fields
      const email = data[headerMap["E-postadresse"]]
        ? String(data[headerMap["E-postadresse"]]).toLowerCase().trim()
        : null;
      const regionName = data[headerMap["Region"]]
        ? String(data[headerMap["Region"]]).trim()
        : null;
      const orgName = data[headerMap["Organisasjon"]]
        ? String(data[headerMap["Organisasjon"]]).trim()
        : null;

      if (
        !email ||
        !regionName ||
        !orgName ||
        !data[headerMap["Fødselsdato"]]
      ) {
        skippedCount++;
        continue;
      }

      // Date Parsing
      let dobDate: Date;
      try {
        dobDate = parse(
          String(data[headerMap["Fødselsdato"]]),
          "dd.MM.yyyy",
          new Date(),
        );
        if (isNaN(dobDate.getTime())) throw new Error("Invalid date");
      } catch {
        console.warn(`Skipping ${email}: Invalid date format for DOB.`);
        skippedCount++;
        continue;
      }

      // Contact Parsing
      const contactStrings = String(data[headerMap["Pårørende"]] || "");
      const { family: familyContact, school: schoolContact } =
        parseAllContacts(contactStrings);

      if (!familyContact) {
        console.warn(
          `Skipping ${email}: Missing critical Pårørende (Family) data.`,
        );
        skippedCount++;
        continue;
      }

      const schoolName = schoolContact?.name || "Ukjent";
      const schoolRelation = schoolContact?.relation || "Skolekontakt";
      const schoolTel = schoolContact?.tel || "00000000";

      // Database Operations
      const region = await prisma.region.upsert({
        where: { name: regionName },
        update: {},
        create: { name: regionName },
      });

      const organization = await prisma.organization.upsert({
        where: { name: orgName },
        update: { regionId: region.id },
        create: {
          name: orgName,
          regionId: region.id,
          canVote: sanitizeBoolean(data[headerMap["Status"]] || true),
        },
      });

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
            dob: dobDate,
            family: familyContact.name,
            family_relation: familyContact.relation,
            family_tel: familyContact.tel,
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
                data[headerMap["Antall Elevting deltatt på tidligere"]] || "0",
              ) || 0,
            elected_representative: sanitizeBoolean(
              data[headerMap["Tillittsvalgt"]],
            ),
            docs_approved_once: sanitizeBoolean(
              data[headerMap["Dokumenter godkjent første gang"]],
            ),
            docs_approved_twice: sanitizeBoolean(
              data[headerMap["Dokumenter godkjent andre gang"]],
            ),
            room_number: data[headerMap["Romnummer"]] || null,
            notes: data[headerMap["Notater"]] || null,
            checked_in: sanitizeBoolean(data[headerMap["Sjekket inn"]]),
            regionId: region.id,
            organizationId: organization.id,
          },
          create: {
            email: email,
            name: data[headerMap["Navn"]],
            tel: String(data[headerMap["Mobilnummer"]] || ""),
            participant_id: String(data[headerMap["Skiltnummer"]]),
            gender: sanitizeGender(data[headerMap["Kjønn"]] || "OTHER"),
            type: sanitizeType(data[headerMap["Status"]] || "OBSERVER"),
            dob: dobDate,
            family: familyContact.name,
            family_relation: familyContact.relation,
            family_tel: familyContact.tel,
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
                data[headerMap["Antall Elevting deltatt på tidligere"]] || "0",
              ) || 0,
            elected_representative: sanitizeBoolean(
              data[headerMap["Tillittsvalgt"]],
            ),
            docs_approved_once: sanitizeBoolean(
              data[headerMap["Dokumenter godkjent første gang"]],
            ),
            docs_approved_twice: sanitizeBoolean(
              data[headerMap["Dokumenter godkjent andre gang"]],
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
        console.error(`Error creating participant ${email}:`, e.message || e);
        skippedCount++;
      }
    }

    revalidatePath("/hjem/participants");
    return {
      success: true,
      message: `Sync fullført. Opprettet/Oppdatert: ${createdCount}, Hoppet over: ${skippedCount}`,
    };
  } catch (error: any) {
    console.error("Processing Error:", error);
    throw new Error(`Feil under behandling av data: ${error.message}`);
  }
}

// --- 4. EXPORTED ACTIONS ---

// A. Manual Upload
export async function importParticipants(formData: FormData) {
  await checkImportAuth();

  const file = formData.get("excelFile") as File;
  if (!file || file.size === 0) {
    return { success: false, message: "Ingen fil valgt." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return await processExcelBuffer(buffer);
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

// B. Automatic Sync
export async function syncFromLegacySystem() {
  await checkImportAuth();

  const url = process.env.LEGACY_EXPORT_URL;
  if (!url) {
    return { success: false, message: "Legacy URL er ikke konfigurert." };
  }

  try {
    // 1. Get Cached Cookie
    let cookieConfig = await prisma.config.findUnique({
      where: { key: "LEGACY_SESSION_COOKIE" },
    });
    let cookie = cookieConfig?.value;

    // 2. Initial Fetch Attempt
    let response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Cookie: cookie || "",
        "User-Agent": "Mozilla/5.0 (compatible; ElevtingetBot/1.0)",
      },
    });

    // 3. Retry Logic
    if (
      response.status === 401 ||
      response.status === 403 ||
      response.url.includes("login")
    ) {
      console.log("Session expired. Attempting to log in...");
      cookie = await refreshLegacySession();

      response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        headers: {
          Cookie: cookie || "",
          "User-Agent": "Mozilla/5.0 (compatible; ElevtingetBot/1.0)",
        },
      });
    }

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        throw new Error(
          "Nedlasting feilet: Systemet returnerte HTML (login-side) selv etter login-forsøk.",
        );
      }
      throw new Error(
        `Feil ved nedlasting: ${response.status} ${response.statusText}`,
      );
    }

    // 4. Process
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return await processExcelBuffer(buffer);
  } catch (error: any) {
    console.error("Sync Error:", error);
    return { success: false, message: `Sync feilet: ${error.message}` };
  }
}
