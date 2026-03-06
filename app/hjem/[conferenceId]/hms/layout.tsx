import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HMS Dashboard",
};

export default function HmsLayout({ children }: { children: React.ReactNode }) {
  return (
    // 1. Main container to enable flexible row layout (for sidebar/navbar)
    <div className="bg-white min-h-screen min-w-full md:flex flex-row">
      {/* 2. Main content area (grows to fill available space) */}
      <main className="flex-grow w-full">
        {/* The HmsDashboardPage component renders here */}
        {children}
      </main>
    </div>
  );
}
