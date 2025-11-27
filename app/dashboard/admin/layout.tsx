import React from "react";
import { Metadata } from "next";
import NavbarAuthorized from "@/components/authorized/authorized-navbar";
import { Protect } from "@/components/protect"; // For the top-level guard
import AdminSidebar from "@/components/admin/admin-sidebar"; // New component for admin links

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Protect the entire admin section with a general permission
    <Protect permission="admin:view">
      <div className="bg-white min-h-screen md:flex md:flex-row">
        <NavbarAuthorized /> {/* Your existing vertical/mobile navigation */}
        <main className="flex-grow flex w-full">
          {/* Admin Sidebar for internal navigation (Config, Users, Roles) */}
          <AdminSidebar />

          <div className="p-6 md:p-10 flex-grow">{children}</div>
        </main>
      </div>
    </Protect>
  );
}
