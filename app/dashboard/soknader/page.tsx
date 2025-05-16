import React from "react";
import UserAvatar from "@/components/user-avatar";
import SignOut from "@/components/sign-out";
import GetUserInfo from "@/components/js/get-user-info";
import NavbarAuthorized from "@/components/authorized-navbar";

import { PrismaClient } from "@prisma/client";
import { BiCheckbox, BiCheckboxChecked, BiCheckSquare } from "react-icons/bi";
import { Metadata } from "next";
import CaseTable from "@/components/case-table";

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
    <div className="bg-white min-w-screen min-h-screen flex flex-row">
      <NavbarAuthorized />
      <main className="flex flex-row flex-grow items-center justify-center w-full h-full p-6 md:p-10">
        <CaseTable initialUser={user} initialCases={cases} />
      </main>
    </div>
  );
}
