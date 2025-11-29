import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  text,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  text: string; // Fallback for clients without HTML
  html?: string;
  attachments?: any[];
}) {
  console.log("Running nodemailer...");
  try {
    const configEntry = await prisma.config.findUnique({
      where: { key: "ENABLE_MAIL" },
    });
    const isEnabled = configEntry?.value === "TRUE";

    if (!isEnabled || to != "birk@elev.no") {
      console.log(`🚫 Email sending disabled. Skipped email to: ${to}`);
      return { success: true, skipped: true }; // Return success so the UI doesn't show an error
    }

    const info = await transporter.sendMail({
      from: `"Elevtinget" <${process.env.GMAIL_FROM}>`,
      to,
      subject,
      text,
      html: html || text, // Use text as HTML fallback if not provided
      attachments: attachments,
    });
    console.log("Message sent: %s", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
