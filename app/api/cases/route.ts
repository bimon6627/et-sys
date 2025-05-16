// app/api/cases.ts
import { prisma } from "@/lib/prisma"; // import your Prisma client

// Define the handler for the POST request
export async function POST(req: Request, res: Response) {
  return new Response(JSON.stringify({ error: "Method not allowed." }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(req: Request, res: Response) {
  try {
    const allCases = await prisma.case.findMany({
      include: {
        formReply: true, // This tells Prisma to also fetch the related FormReply data
      },
    });

    if (allCases) {
      // Send a successful response with the fetched value
      return new Response(JSON.stringify({ success: true, value: allCases }), {
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
