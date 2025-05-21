// pages/api/form-reply.ts
import { prisma } from "@/lib/prisma"; // import your Prisma client
import { getToken } from "next-auth/jwt";

const secret = process.env.AUTH_SECRET;

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
        status: null,
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
      type,
      id,
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
    fromDate.setHours(fromHours, fromMinutes, 0, 0); // set HH:MM:SS:MS

    const toDate = new Date(startDate);
    if (not_returning) {
      toDate.setDate(startDate.getDate() + 6);
    } else {
      toDate.setDate(startDate.getDate() + parseInt(to_day));
      const [toHours, toMinutes] = to_time.split(":").map(Number);
      toDate.setHours(toHours, toMinutes, 0, 0); // set HH:MM:SS:MS
    }

    const updatedForm = await prisma.formReply.update({
      where: { id: id },
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

export async function GET(req: Request, res: Response) {
  return new Response(JSON.stringify({ error: "Method not allowed." }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}
