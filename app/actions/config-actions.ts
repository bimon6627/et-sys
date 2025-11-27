"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// --- SECURITY CHECK ---
async function checkAdminAuth() {
  const session = await auth();
  const permissions = session?.user?.permissions || [];
  if (!permissions.includes("admin:view")) {
    throw new Error("Unauthorized");
  }
}

// --- GET CONFIG ---
export async function getEventConfig() {
  const start = await prisma.config.findUnique({
    where: { key: "START_DATE" },
  });
  const end = await prisma.config.findUnique({ where: { key: "END_DATE" } });
  const canSendEmails = await prisma.config.findUnique({
    where: { key: "ENABLE_MAIL" },
  });
  return {
    startDate: start?.value || "",
    endDate: end?.value || "",
    canSendEmails: canSendEmails?.value || "",
  };
}

// --- UPDATE CONFIG ---
export async function updateEventConfig(startDate: string, endDate: string) {
  await checkAdminAuth();

  try {
    if (startDate) {
      await prisma.config.upsert({
        where: { key: "START_DATE" },
        update: { value: startDate },
        create: { key: "START_DATE", value: startDate },
      });
    }

    if (endDate) {
      await prisma.config.upsert({
        where: { key: "END_DATE" },
        update: { value: endDate },
        create: { key: "END_DATE", value: endDate },
      });
    }

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error) {
    console.error("Config update failed:", error);
    return { success: false, message: "Kunne ikke lagre konfigurasjon." };
  }
}
