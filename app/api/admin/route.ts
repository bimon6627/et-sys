// pages/api/form-reply.ts
import { prisma } from "@/lib/prisma"; // import your Prisma client

// Define the handler for the POST request
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { value } = body;

    await prisma.config.update({
      where: {
        key: "START_DATE",
      },
      data: {
        value: value,
      },
    });
    // Send a response back to the client
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

export async function GET() {
  try {
    const startDateConfig = await prisma.config.findUnique({
      where: { key: "START_DATE" },
    });

    if (startDateConfig) {
      // Send a successful response with the fetched value
      return new Response(
        JSON.stringify({ success: true, value: startDateConfig.value }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "START_DATE configuration not found." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error fetching START_DATE:", error);
    console.error(error);
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
