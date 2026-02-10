"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/mail";
import path from "path";

// --- SECURITY HELPER ---
async function checkPermission(permission: string) {
  const session = await auth();
  const permissions = session?.user?.permissions || [];
  if (!permissions.includes(permission)) {
    throw new Error("Unauthorized");
  }
  return session?.user?.email;
}

// --- 1. FETCH CASES (Replaces GET /api/cases) ---
export async function getFilteredCases(filter: string) {
  // Basic read permission check
  const session = await auth();
  if (!session?.user?.permissions.includes("case:read")) return [];

  let whereClause: any = {};
  const now = new Date();
  // Map frontend filter buttons to Database queries
  switch (filter) {
    case "REQUIRE_ACTION":
      whereClause = {
        status: true,
        id_swapped: false,
        formReply: {
          has_observer: true,
          from: {
            lte: now,
          },
          to: {
            gte: now,
          },
        },
      };
      break;
    case "PENDING":
      whereClause = { status: null };
      break;
    case "APPROVED":
      whereClause = { status: true };
      break;
    case "REJECTED":
      whereClause = { status: false };
      break;
    case "EXPIRED":
      // Complex logic: Pending AND end date has passed
      whereClause = {
        formReply: {
          to: { lt: new Date() },
        },
      };
      break;
    case "ALL":
    default:
      whereClause = {}; // No filter
      break;
  }

  try {
    const cases = await prisma.case.findMany({
      where: whereClause,
      include: {
        formReply: true,
        // 💡 Fetch linked participant to display verified info
        participant: {
          select: {
            id: true,
            name: true,
            participant_id: true,
            email: true,
            tel: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });
    return cases;
  } catch (error) {
    console.error("Error fetching cases:", error);
    return [];
  }
}

// --- 2. REVIEW CASE (Replaces PATCH /api/cases) ---
export async function reviewCase(
  caseId: number,
  status: boolean | null,
  reason_rejected: string,
) {
  const reviewerEmail = await checkPermission("case:write");

  try {
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: {
        status: status,
        reason_rejected: status === false ? reason_rejected : null,
        reviewedBy: reviewerEmail,
        reviewedAt: new Date(),
      },
      include: { formReply: true },
    });

    const recipient = updatedCase.formReply.email;

    let subject = "";
    let messageBody = "";
    const signature = `
    <table
    role="presentation"
    border="0"
    cellpadding="0"
    cellspacing="0"
    style="border-collapse: collapse; width: 100%; max-width: 600px"
  >
    <tr>
      <td style="width: 100px; padding-right: 20px; vertical-align: top">
        <img
          src="cid:logo-image"
          alt="Logo"
          width="100"
          style="
            display: block;
            border: 0;
            outline: none;
            text-decoration: none;
          "
        />
      </td>
      <td
        style="
          vertical-align: top;
          font-family: Arial, sans-serif;
          color: #333333;
        "
      >
        <p
          style="
            margin: 0 0 5px 0;
            color: #0A466E;
          "
        >
          <strong>Kontrollkomitéen</strong><br />
          <a
            href="mailto:konkom@elev.no"
            style="color: #0A466E;"
            >konkom@elev.no</a
          >
        </p>
        <p
          style="
            margin: 0 0 5px 0;
            color: #0A466E;
          "
        >
          <strong>Elevorganisasjonen</strong><br />
          <a
            href="mailto:elev@elev.no"
            style="color: #0A466E;"
            >elev@elev.no</a
          ></p>
        </p>
        <a
        href="https://elev.no/"
        style="color: #FF6340"
        >
          https://elev.no
        </a>
      </td>
    </tr>
  </table>`;

    if (status === true) {
      subject = "Permisjonssøknad Godkjent";
      messageBody =
        `
            <p>Hei ${updatedCase.formReply.name},</p>
            <p>Din søknad om permisjon er <strong>godkjent</strong>.</p>
            <p>Du har fått innvilget permisjon i tidsrommet ${updatedCase.formReply.from.toLocaleString(
              "no-NO",
            )} - ${updatedCase.formReply.to.toLocaleString("no-NO")}</p>
            ` +
        (updatedCase.formReply.has_observer
          ? `<p>Husk å bytte skilt med observatøren din når du skal dra.</p>`
          : "") +
        '<p style="font-size: 13px; font-style: italic; color: #666;">Denne e-posten kan ikke besvares.</p>' +
        signature;
    } else if (status === false) {
      subject = "Permisjonssøknad Avvist";
      messageBody = `
            <p>Hei ${updatedCase.formReply.name},</p>
            <p>Din søknad om permisjon fra ${updatedCase.formReply.from.toLocaleString(
              "no-NO",
            )} til ${updatedCase.formReply.to.toLocaleString(
              "no-NO",
            )} er <strong>avvist</strong>.</p>
            <p><strong>Årsak:</strong></p>
            <p style="padding-left: 20px;">${reason_rejected}</p>
            <p>Dersom du mener dette er feil, vennligst ta kontakt med oss i infokiosk.</p>
            <p style="font-size: 13px; font-style: italic; color: #666;">Denne e-posten kan ikke besvares.</p>
            ${signature}
        `;
    }

    if (status !== null && recipient) {
      await sendEmail({
        to: recipient,
        subject: `${subject}`,
        text: messageBody.replace(/<[^>]*>?/gm, ""), // Strip HTML for text version
        html: messageBody,
        attachments: [
          {
            filename: "EOlogo.png",
            path: path.join(process.cwd(), "public", "assets", "EOlogo.png"),
            cid: "logo-image",
          },
        ],
      });
    }

    revalidatePath("/hjem/soknader");
    return { success: true };
  } catch (error) {
    console.error("Error reviewing case:", error);
    return { success: false, message: "Kunne ikke lagre behandling." };
  }
}

// --- 3. UPDATE FORM DATA (Replaces PATCH /api/form-reply) ---
export async function updateCaseFormData(formId: number, formData: any) {
  await checkPermission("case:write");

  try {
    // 💡 FIX: We no longer calculate dates from config.
    // The Admin Dialog sends full ISO strings ('from', 'to'), so we use them directly.

    await prisma.formReply.update({
      where: { id: formId },
      data: {
        name: formData.name,
        email: formData.email,
        tel: formData.tel,
        county: formData.county,
        type: formData.type,
        participant_id: formData.participant_id,
        reason: formData.reason,
        has_observer: formData.has_observer,
        observer_name: formData.observer_name,
        observer_id: formData.observer_id,
        observer_tel: formData.observer_tel,

        // Use dates directly from the payload
        from: new Date(formData.from),
        to: new Date(formData.to),
      },
    });

    revalidatePath("/hjem/soknader");
    return { success: true };
  } catch (error) {
    console.error("Error updating form data:", error);
    return { success: false, message: "Kunne ikke oppdatere søknadsdata." };
  }
}

// --- 4. DELETE CASE (Replaces DELETE /api/cases) ---
export async function deleteCase(caseId: number) {
  await checkPermission("case:delete");

  try {
    // Delete the Case (Cascade rules might apply, but usually we delete Case first, then FormReply if needed)
    // If you want to delete both, you might need a transaction or configured cascade delete
    const caseItem = await prisma.case.findUnique({ where: { id: caseId } });

    if (caseItem) {
      // Delete Case
      await prisma.case.delete({ where: { id: caseId } });
      // Delete associated FormReply
      await prisma.formReply.delete({ where: { id: caseItem.formReplyId } });
    }

    revalidatePath("/hjem/soknader");
    return { success: true };
  } catch (error) {
    console.error("Error deleting case:", error);
    return { success: false, message: "Kunne ikke slette sak." };
  }
}
