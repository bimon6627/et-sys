import React from "react";
import { Metadata } from "next";
import SettingsSidebar, {
  SettingsFooter,
} from "@/components/settings/settings-navigation";

export const metadata: Metadata = {
  title: "Innstillinger",
};

interface SettingsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ conferenceId: string }>; // 1. Define params type
}

export default async function SettingsLayout({
  children,
  params,
}: SettingsLayoutProps) {
  // 2. Await the params to extract the ID
  const { conferenceId } = await params;
  return (
    <div className="bg-white min-h-screen md:flex md:flex-row">
      <main className="flex flex-col md:flex-row flex-grow w-full">
        <SettingsSidebar conferenceShortname={conferenceId} />

        <div className="p-6 md:p-10 flex-grow">{children}</div>
        <SettingsFooter conferenceShortname={conferenceId} />
      </main>
    </div>
  );
}
