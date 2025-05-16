import React from "react";
import UserAvatar from "@/components/user-avatar";
import SignOut from "@/components/sign-out";
import GetUserInfo from "@/components/js/get-user-info";
import NavbarAuthorized from "@/components/authorized-navbar";
import AdminComponent from "@/components/admin-component"; // Import the AdminComponent

export default function Dashboard() {
  return (
    <div className="bg-white min-w-screen min-h-screen flex flex-row">
      <NavbarAuthorized />
      <main className="flex flex-col flex-grow items-center justify-center w-full h-full p-6 md:p-10">
        <AdminComponent />
      </main>
    </div>
  );
}
