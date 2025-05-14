// pages/api/form-reply.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma"; // import your Prisma client
import { DateTime } from "next-auth/providers/kakao";

// Define the handler for the POST request
export async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
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
      } = req.body;

      const configEntry = await prisma.config.findUnique({
        where: { key: "START_DATE" },
      });

      if (!configEntry || !configEntry.value) {
        throw new Error("START_DATE not found in config.");
      }
      const startDate = new Date(configEntry.value);
      const fromDate = new Date(startDate);
      fromDate.setDate(startDate.getDate() + from_day);
      const [fromHours, fromMinutes] = from_time.split(":").map(Number);
      fromDate.setHours(fromHours, fromMinutes, 0, 0); // set HH:MM:SS:MS

      const toDate = new Date(startDate);
      if (not_returning) {
        toDate.setDate(startDate.getDate() + 100);
      } else {
        toDate.setDate(startDate.getDate() + to_day);
        const [toHours, toMinutes] = to_time.split(":").map(Number);
        toDate.setHours(toHours, toMinutes, 0, 0); // set HH:MM:SS:MS
      }

      const newFormSubmission = await prisma.formReply.create({
        data: {
          name: name,
          email: email,
          tel: parseInt(tel),
          county: county,
          type: type,
          participant_id: parseInt(id),
          from: fromDate,
          to: toDate,
          reason: reason,

          has_observer: has_observer,
          observer_name: observer_name,
          observer_id: parseInt(observer_id),
          observer_tel: parseInt(observer_tel),
        },
      });

      // Send a response back to the client
      res.status(200).json({ message: "Form submitted successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error saving form submission" });
    }
  } else {
    // Handle any non-POST request
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
