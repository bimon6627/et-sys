import NavbarAuthorized from "@/components/authorized/authorized-navbar";

import { PrismaClient } from "@prisma/client";
import { Metadata } from "next";
import CaseTable from "@/components/case-table";
import { Protect } from "@/components/protect";
import { requireAuth } from "@/lib/auth-guard";

const prisma = new PrismaClient();

async function getAllCases() {
  try {
    const allCases = await prisma.case.findMany({
      include: {
        formReply: true, // This tells Prisma to also fetch the related FormReply data
      },
    });
    return allCases;
  } catch (error) {
    console.error("Error fetching cases with form replies:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

export const metadata: Metadata = {
  title: "Søknader",
};

export default async function Soknader() {
  // REMOVED: const user = await GetUserInfo();
  const cases = await getAllCases();
  await requireAuth();

  return (
    <Protect permission="case:read">
      <div className="bg-white max-w-screen min-h-screen md:flex flex-row">
        <NavbarAuthorized />
        <main className="mx-auto w-full md:mx-5">
          {/* REMOVED: user={user} */}
          <CaseTable initialCases={cases} />
        </main>
      </div>
    </Protect>
  );
}
