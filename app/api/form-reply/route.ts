// app/api/form-reply.ts
import { prisma } from "@/lib/prisma";
// import { getToken } from "next-auth/jwt"; // Remove this line
import { auth } from "@/auth"; // Import the auth helper from your auth.ts file
import { NextResponse } from "next/server"; // Import NextResponse

// const secret = process.env.AUTH_SECRET; // No longer needed if using auth()

// Define the handler for the POST request
// Note: This POST handler does not currently have authentication.
// If it's a public endpoint for form submissions, that's fine.
// If it should be protected, you'd add the 'auth()' check here too.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      type,
      id,
      name,
      email,
      county,
      from_day,
      from_time,
      to_day,
      to_time,
      tel,
      has_observer,
      not_returning,
      reason,
      observer_name,
      observer_id,
      observer_tel,
    } = body;

    const configEntry = await prisma.config.findUnique({
      where: { key: "START_DATE" },
    });

    if (!configEntry || !configEntry.value) {
      throw new Error("START_DATE not found in config.");
    }
    const startDate = new Date(configEntry.value);
    const fromDate = new Date(startDate);
    fromDate.setDate(startDate.getDate() + parseInt(from_day));
    const [fromHours, fromMinutes] = from_time.split(":").map(Number);
    fromDate.setHours(fromHours, fromMinutes, 0, 0);

    const toDate = new Date(startDate);
    if (not_returning) {
      toDate.setDate(startDate.getDate() + 6);
    } else {
      toDate.setDate(startDate.getDate() + parseInt(to_day));
      const [toHours, toMinutes] = to_time.split(":").map(Number);
      toDate.setHours(toHours, toMinutes, 0, 0);
    }

    const newFormSubmission = await prisma.formReply.create({
      data: {
        name: name,
        email: email,
        tel: tel,
        county: county,
        type: type,
        participant_id: id, // Assuming 'id' from body is participant_id
        from: fromDate,
        to: toDate,
        reason: reason,

        has_observer: has_observer,
        observer_name: observer_name,
        observer_id: observer_id,
        observer_tel: observer_tel,
      },
    });

    await prisma.case.create({
      data: {
        formReply: {
          connect: {
            id: newFormSubmission.id,
          },
        },
        id_swapped: false,
        status: null,
        reason_rejected: "",
        comment: "",
        reviewedById: 0, // Consider linking to a real user ID if possible
        reviewedBy: "",
        reviewedAt: new Date("0"), // Consider using new Date() for creation time
      },
    });

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    // Use 'unknown' for error type
    console.error("Error in POST /api/form-reply:", error);
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PATCH(req: Request) {
  try {
    // Authenticate using the auth() helper
    const session = await auth();

    if (!session) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Access the role directly from session.user
    if (session.user.role !== "ADMIN" && session.user.role !== "KONKOM") {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      type,
      id, // This `id` is for the FormReply record to update
      participant_id,
      name,
      email,
      county,
      from_day,
      from_time,
      to_day,
      to_time,
      tel,
      has_observer,
      not_returning,
      reason,
      observer_name,
      observer_id,
      observer_tel,
    } = body;

    const configEntry = await prisma.config.findUnique({
      where: { key: "START_DATE" },
    });

    if (!configEntry || !configEntry.value) {
      throw new Error("START_DATE not found in config.");
    }
    const startDate = new Date(configEntry.value);
    const fromDate = new Date(startDate);
    fromDate.setDate(startDate.getDate() + parseInt(from_day));
    const [fromHours, fromMinutes] = from_time.split(":").map(Number);
    fromDate.setHours(fromHours, fromMinutes, 0, 0);

    const toDate = new Date(startDate);
    if (not_returning) {
      toDate.setDate(startDate.getDate() + 6);
    } else {
      toDate.setDate(startDate.getDate() + parseInt(to_day));
      const [toHours, toMinutes] = to_time.split(":").map(Number);
      toDate.setHours(toHours, toMinutes, 0, 0);
    }

    // Ensure `id` is a number for Prisma update where clause if it's an Int field
    const formReplyId = parseInt(id, 10);
    if (isNaN(formReplyId)) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid ID format for FormReply" }),
        { status: 400 }
      );
    }

    await prisma.formReply.update({
      where: { id: formReplyId }, // Use parsed ID
      data: {
        name: name,
        email: email,
        tel: tel,
        county: county,
        type: type,
        participant_id: participant_id,
        from: fromDate,
        to: toDate,
        reason: reason,

        has_observer: has_observer,
        observer_name: observer_name,
        observer_id: observer_id,
        observer_tel: observer_tel,
      },
    });

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    // Use 'unknown' for error type
    console.error("Error in PATCH /api/form-reply:", error);
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET() {
  return new NextResponse(JSON.stringify({ error: "Method not allowed." }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}
