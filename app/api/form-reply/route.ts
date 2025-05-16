// pages/api/form-reply.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma"; // import your Prisma client

// Define the handler for the POST request
export async function POST(req: Request, res: Response) {
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
    fromDate.setHours(fromHours, fromMinutes, 0, 0); // set HH:MM:SS:MS
    console.log(configEntry.value);
    console.log(startDate.toString());
    console.log(fromDate.toString());
    console.log(from_day);

    const toDate = new Date(startDate);
    if (not_returning) {
      toDate.setDate(startDate.getDate() + 6);
    } else {
      toDate.setDate(startDate.getDate() + parseInt(to_day));
      const [toHours, toMinutes] = to_time.split(":").map(Number);
      toDate.setHours(toHours, toMinutes, 0, 0); // set HH:MM:SS:MS
    }

    const newFormSubmission = await prisma.formReply.create({
      data: {
        name: name,
        email: email,
        tel: tel,
        county: county,
        type: type,
        participant_id: id,
        from: fromDate,
        to: toDate,
        reason: reason,

        has_observer: has_observer,
        observer_name: observer_name,
        observer_id: observer_id,
        observer_tel: observer_tel,
      },
    });

    const newCase = await prisma.case.create({
      data: {
        formReply: {
          connect: {
            id: newFormSubmission.id,
          },
        },
        id_swapped: false,
        status: false,
        reason_rejected: "",
        comment: "",
        reviewedById: 0,
        reviewedBy: "",
        reviewedAt: new Date("0"),
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

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  return new Response(JSON.stringify({ error: "Method not allowed." }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}
