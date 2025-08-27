import React from "react";
import NavbarAuthorized from "@/components/authorized-navbar";
import AdminComponent from "@/components/admin-component"; // Import the AdminComponent
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Admin",
};

export default function Admin() {
  return (
    <div className="bg-white min-w-screen min-h-screen md:flex md:flex-row">
      <NavbarAuthorized />
      <main className="flex flex-col flex-grow items-center justify-center w-full h-full p-6 md:p-10">
        <AdminComponent />
      </main>
    </div>
  );
}
