import React from "react";
import { Metadata } from "next";
import { Protect } from "@/components/protect"; // For the top-level guard
import AdminSidebar, { AdminFooter } from "@/components/admin/admin-sidebar"; // New component for admin links
import NavbarAuthorized from "@/components/authorized/authorized-navbar";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Protect permission="admin:view">
      <div className="bg-white min-h-screen md:flex md:flex-row">
        <NavbarAuthorized />
        <main className="flex flex-col md:flex-row flex-grow w-full">
          <AdminSidebar />

          <div className="p-6 md:p-10 flex-grow">{children}</div>
          <AdminFooter />
        </main>
      </div>
    </Protect>
  );
}
