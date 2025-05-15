import React from "react";
import UserAvatar from "@/components/user-avatar";
import SignOut from "@/components/sign-out";
import GetUserInfo from "@/components/js/get-user-info";
import NavbarAuthorized from "@/components/authorized-navbar";

import { PrismaClient } from "@prisma/client";
import { BiCheckbox, BiCheckboxChecked, BiCheckSquare } from "react-icons/bi";

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

async function getStartDate() {
  try {
    const startDate = await prisma.config.findUnique({
      where: { key: "START_DATE" },
    });
    if (startDate) {
      return new Date(startDate.value);
    } else {
      console.error("START_DATE not found.");
    }
  } catch (error) {
    console.error("Error fetching config:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

function getDateString(inDate: Date) {
  const offset = inDate.getDay();
  let day = "";
  switch (offset) {
    case 0:
      day = "Mandag";
    case 1:
      day = "Tirsdag";
    case 2:
      day = "Onsdag";
    case 3:
      day = "Torsdag";
    case 4:
      day = "Fredag";
  }
  if (offset > 4) return "Kommer ikke tilbake";

  const hours = inDate.getHours();
  const mins = inDate.getMinutes();

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(mins).padStart(2, "0");

  return day + " " + formattedHours + ":" + formattedMinutes;
}

export default async function Soknader() {
  const user = await GetUserInfo();
  const cases = await getAllCases(); // Fetch the cases
  const startDate = (await getStartDate()) ?? new Date();

  return (
    <div className="bg-white min-w-screen min-h-screen flex flex-row">
      <NavbarAuthorized />
      <main className="flex flex-row flex-grow items-center justify-center w-full h-full p-6 md:p-10">
        <div className="space-y-3 top-20">
          <h1 className="text-3xl md:text-5xl font-bold text-center">
            Permisjonssøknader
          </h1>

          <div className="border-collapse border outline-gray-400 overflow-hidden text-center rounded-t-lg shadow-md">
            <table className="table-auto">
              <thead>
                <tr className="bg-eo-lblue">
                  <th className="rounded-tl-sm px-3 py-2">ID</th>
                  <th className="px-3 py-2">Navn</th>
                  <th className="px-3 py-2">Skiltnr.</th>
                  <th className="px-3 py-2">E-post</th>
                  <th className="px-3 py-2">Telefon</th>
                  <th className="px-3 py-2">Fylke</th>
                  <th className="px-3 py-2">Fra</th>
                  <th className="px-3 py-2">Til</th>
                  <th className="px-3 py-2">Årsak</th>
                  <th className="px-3 py-2">Har observatør</th>
                  <th className="px-3 py-2">Observatør navn</th>
                  <th className="px-3 py-2">Observatør skiltnr.</th>
                  <th className="rounded-tr-sm px-3 py-2">
                    Observatør telefon
                  </th>
                </tr>
              </thead>
              <tbody>
                {cases &&
                  cases.map((caseItem) => (
                    <tr
                      key={caseItem.id}
                      className={`border-b ${
                        caseItem.id % 2 == 0 ? "bg-gray-100" : "bg-white"
                      }`}
                    >
                      <td className="px-3 py-2 border-r-2">{caseItem.id}</td>
                      <td className="px-3 py-2 border-r-2">
                        {caseItem.formReply.name}
                      </td>
                      <td className="px-3 py-2 border-r-2">
                        {caseItem.formReply.participant_id}
                      </td>
                      <td className="px-3 py-2 border-r-2">
                        {caseItem.formReply.email}
                      </td>
                      <td className="px-3 py-2 border-r-2">
                        {caseItem.formReply.tel}
                      </td>
                      <td className="px-3 py-2 border-r-2">
                        {caseItem.formReply.county}
                      </td>
                      <td className="px-3 py-2 border-r-2">
                        {getDateString(caseItem.formReply.from)}
                      </td>
                      <td className="px-3 py-2 border-r-2">
                        {getDateString(caseItem.formReply.to)}
                      </td>
                      <td className="px-3 py-2 border-r-2">
                        {caseItem.formReply.reason}
                      </td>
                      <td className="flex justify-center items-center px-3 py-2">
                        {caseItem.formReply.has_observer ? (
                          <BiCheckboxChecked style={{ fontSize: "1.5em" }} />
                        ) : (
                          <BiCheckbox style={{ fontSize: "1.5em" }} />
                        )}
                      </td>
                      <td className="px-3 py-2 border-r-2">
                        {caseItem.formReply.observer_name}
                      </td>
                      <td className="px-3 py-2 border-r-2">
                        {caseItem.formReply.observer_id}
                      </td>
                      <td className="px-3 py-2">
                        {caseItem.formReply.observer_tel}
                      </td>
                    </tr>
                  ))}
                {!cases && <p>Failed to load cases.</p>}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
