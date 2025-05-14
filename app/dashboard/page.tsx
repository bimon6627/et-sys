import React from "react";
import UserAvatar from "@/components/user-avatar";
import SignOut from "@/components/sign-out";
import GetUserInfo from "@/components/js/get-user-info";

export default async function Dashboard() {
  const user = await GetUserInfo();
  return (
    <div>
      <main className="flex flex-grow items-center justify-center w-full h-full">
        <div className="absolute w-1/2 space-y-3 top-20">
          <h1 className="text-5xl font-bold text-center">Elevtinget 2025</h1>
          <div>Hey there {user?.name ?? ""}!</div>
          <UserAvatar />
          <SignOut text="Logg ut" />
        </div>
      </main>
    </div>
  );
}
