// app/api/cases.ts
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
// import { getToken } from "next-auth/jwt"; // Remove this line
import { auth } from "@/auth"; // Import the auth helper from your auth.ts file (adjust path if needed)
import { NextResponse } from "next/server"; // Import NextResponse for better JSON responses

// const secret = process.env.AUTH_SECRET; // No longer needed if using auth()

// Define the handler for the POST request
export async function POST() {
  return new NextResponse(JSON.stringify({ error: "Method not allowed." }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
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
    const { id, status, reason_rejected, reviewedBy, reviewedAt } = body;

    // Type casting for status (ensure it matches your Prisma schema for `status` field)
    const boolStatus: boolean | null =
      status === "null" ? null : status === "true";
    // Ensure `id` is a number for Prisma update where clause if it's an Int field
    const caseId = parseInt(id, 10);
    if (isNaN(caseId)) {
      return new NextResponse(JSON.stringify({ error: "Invalid ID format" }), {
        status: 400,
      });
    }

    await prisma.case.update({
      where: { id: caseId }, // Use parsed ID
      data: {
        status: boolStatus,
        reason_rejected: reason_rejected,
        reviewedBy: reviewedBy,
        reviewedAt: reviewedAt,
      },
    });

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    // Use 'unknown' for error type
    console.error("Error in PATCH /api/cases:", error);
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

export async function DELETE(req: Request) {
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

    const caseId = await req.json();

    const currentCase = await prisma.case.findUnique({
      where: { id: caseId },
      include: { formReply: true },
    });

    const formReplyID = currentCase?.formReply.id;

    await prisma.case.delete({
      where: { id: caseId },
    });

    await prisma.formReply.delete({
      where: { id: formReplyID },
    });

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    // Use 'unknown' for error type
    console.error("Error in DELETE /api/cases:", error);
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

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const commonInclude = {
      include: {
        formReply: true, // This tells Prisma to also fetch the related FormReply data
      },
    };

    const whereClause: Prisma.CaseWhereInput = {};
    const now = new Date();

    switch (status) {
      case "APPROVED":
        whereClause.status = true;
        whereClause.formReply = {
          to: {
            gt: now,
          },
        };
        break;
      case "ACTIVE":
        whereClause.status = true;
        whereClause.formReply = {
          AND: [
            {
              from: {
                lt: now,
              },
            },
            {
              to: {
                gt: now,
              },
            },
          ],
        };
        break;
      case "SCHEDULED":
        whereClause.status = true;
        whereClause.formReply = {
          from: {
            gt: now,
          },
        };
        break;
      case "EXPIRED":
        whereClause.status = true;
        whereClause.formReply = {
          to: {
            lt: now,
          },
        };
        break;
      case "REJECTED":
        whereClause.status = false;
        break;
      case "PENDING":
        whereClause.status = null;
        break;
      case "REQUIRE_ACTION":
        //Not implemented yet
        break;
      case "ALL":
        break;
      default:
        return new NextResponse(
          JSON.stringify({
            error:
              "Invalid or missing 'status' query parameter. Use 'ALL', 'APPROVED', 'ACTIVE', 'SCHEDULED', 'PENDING', or 'REJECTED'.",
          }),
          {
            status: 400, // Bad Request
            headers: { "Content-Type": "application/json" },
          }
        );
    }

    const cases = await prisma.case.findMany({
      where: whereClause,
      ...commonInclude,
    });

    if (cases) {
      return new NextResponse(JSON.stringify({ success: true, value: cases }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // While it's unlikely for findMany to return null,
      // it's possible if the data.value is empty, but not a true 404
      return new NextResponse(JSON.stringify({ success: true, value: [] }), {
        // Return empty array for no cases found
        status: 200, // Still 200 OK, just no data
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error: unknown) {
    // Use 'unknown' for error type
    console.error("Error in GET /api/cases:", error);
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
