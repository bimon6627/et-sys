import React from "react";
import GetUserInfo from "@/components/js/get-user-info";
import NavbarAuthorized from "@/components/authorized-navbar";

import { PrismaClient } from "@prisma/client";
import { Metadata } from "next";
import CaseTable from "@/components/case-table";
import NavbarAuthorizedHamburger from "@/components/authorized-navbar-hamburger";

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
  const user = GetUserInfo();
  const cases = await getAllCases();
  return (
    <div className="bg-white max-w-screen min-h-screen md:flex flex-row">
      <NavbarAuthorizedHamburger />
      <NavbarAuthorized />
      <main className="mx-auto w-full md:w-3/4">
        <CaseTable initialUser={user} initialCases={cases} />
      </main>
    </div>
  );
}
