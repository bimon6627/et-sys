// app/hjem/[conferenceId]/innstillinger/brukere/page.tsx

import { getConferenceStaff } from "@/app/actions/conference-user-actions";
import StaffListClient from "@/components/conference/staff-list-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arrangører",
};

export default async function ConferenceUsersPage({
  params,
}: {
  params: Promise<{ conferenceId: string }>;
}) {
  const { conferenceId } = await params; // This is the shortname
  const staff = await getConferenceStaff(conferenceId);

  return (
    <div className=" p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Brukere & Tilganger
          </h1>
          <p className="text-gray-500 text-sm">
            Administrer hvem som har tilganag til denne konferansen.
          </p>
        </div>
      </div>

      {/* We separate the Client Logic (Dialog/Delete) into a separate component 
        so this Page can remain an Async Server Component 
      */}
      <StaffListClient initialStaff={staff} shortname={conferenceId} />
    </div>
  );
}
