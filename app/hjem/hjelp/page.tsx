import React from "react";
import NavbarAuthorized from "@/components/authorized/authorized-navbar";
import { Metadata } from "next";
import { BiInfoCircle } from "react-icons/bi";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function Dashboard() {
  return (
    <div className="bg-white min-w-screen min-h-screen md:flex flex-row">
      <NavbarAuthorized />
      <main className="flex flex-row flex-grow items-center justify-center w-full h-full p-6 md:p-10">
        <h1 className="flex flex-row gap-2 text-3xl md:text-5xl font-bold text-center">
          <BiInfoCircle />
          <span>Hjelp</span>
        </h1>
        <p></p>
      </main>
    </div>
  );
}
