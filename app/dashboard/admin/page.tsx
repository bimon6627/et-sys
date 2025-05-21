import React from "react";
import UserAvatar from "@/components/user-avatar";
import SignOut from "@/components/sign-out";
import GetUserInfo from "@/components/js/get-user-info";
import NavbarAuthorized from "@/components/authorized-navbar";
import AdminComponent from "@/components/admin-component"; // Import the AdminComponent
import { Metadata } from "next";
import NavbarAuthorizedHamburger from "@/components/authorized-navbar-hamburger";

export const metadata: Metadata = {
  title: "Admin",
};

export default function Admin() {
  return (
    <div className="bg-white min-w-screen min-h-screen md:flex md:flex-row">
      <NavbarAuthorizedHamburger />
      <NavbarAuthorized />
      <main className="flex flex-col flex-grow items-center justify-center w-full h-full p-6 md:p-10">
        <AdminComponent />
      </main>
    </div>
  );
}
