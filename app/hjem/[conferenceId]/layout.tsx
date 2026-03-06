// app/hjem/[conferenceId]/layout.tsx

import NavbarAuthorized from "@/components/authorized/authorized-navbar";
import { auth } from "@/auth"; // Or your data fetching logic
import { redirect } from "next/navigation";

interface ConferenceLayoutProps {
  children: React.ReactNode;
  params: Promise<{ conferenceId: string }>;
}

export default async function ConferenceLayout({
  children,
  params,
}: ConferenceLayoutProps) {
  // 1. Await params to get the ID (Next.js 15+)
  const { conferenceId } = await params;

  // 2. Optional: You can do a quick security check here if you want
  // to protect the entire folder tree at once.
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="bg-eo-white min-w-screen min-h-screen md:flex flex-row">
      {/* 3. Pass the ID to the Navbar ONCE here */}
      <NavbarAuthorized shortname={conferenceId} />

      {/* 4. Render the specific page content */}
      <main className="flex-grow w-full h-full">{children}</main>
    </div>
  );
}
