// app/api/cases.ts
import { prisma } from "@/lib/prisma"; // import your Prisma client
import { getToken } from "next-auth/jwt";

const secret = process.env.AUTH_SECRET;

// Define the handler for the POST request
export async function POST(req: Request, res: Response) {
  return new Response(JSON.stringify({ error: "Method not allowed." }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PATCH(req: Request, res: Response) {
  try {
    const token = await getToken({ req, secret });
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (token.role !== "ADMIN" && token.role !== "KONKOM") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      id,
      id_swapped,
      status,
      reason_rejected,
      comment,
      reviewedBy,
      reviewedAt,
      reviewedById,
    } = body;
    const boolStatus = status === "null" ? null : status === "true";

    const updatedCase = await prisma.case.update({
      where: { id: id },
      data: {
        status: boolStatus,
        reason_rejected: reason_rejected,
        reviewedBy: reviewedBy,
        reviewedAt: reviewedAt,
      },
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(req: Request, res: Response) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const token = await getToken({ req, secret });
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (token.role !== "ADMIN" && token.role !== "KONKOM") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const commonInclude = {
      include: {
        formReply: true, // This tells Prisma to also fetch the related FormReply data
      },
    };

    let whereClause: any = {};
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
        return new Response(
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
      // Send a successful response with the fetched value
      return new Response(JSON.stringify({ success: true, value: cases }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: "No cases found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error fetching cases:", error);
    console.error(error);
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
