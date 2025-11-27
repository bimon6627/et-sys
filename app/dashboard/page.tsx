import React from "react";
import GetUserInfo from "@/components/js/get-user-info";
import NavbarAuthorized from "@/components/authorized/authorized-navbar";
import { Metadata } from "next";
import DashboardInfo from "@/components/dashboard/dashboard-info";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function Dashboard() {
  const user = await GetUserInfo();
  return (
    <div className="bg-white min-w-screen min-h-screen md:flex flex-row">
      <NavbarAuthorized />
      <main className="flex flex-row flex-grow items-center justify-center w-full h-full p-6 md:p-10">
        <div className="w-1/2 space-y-3 top-20">
          <h1 className="text-3xl md:text-5xl font-bold text-center">
            Elevtinget 2025
          </h1>
          <h2 className="text-2xl md:text-4xl italic">
            Heisann, {(user?.name ?? "").split(" ")[0]}!
          </h2>
          <DashboardInfo />
        </div>
      </main>
    </div>
  );
}
