"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { BiLoaderAlt } from "react-icons/bi";

export default function SessionExpiredPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/", redirect: true });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <BiLoaderAlt className="size-10 animate-spin text-red-600 mb-4" />
      <h1 className="text-xl font-bold text-gray-800">Tilgangen er opphevet</h1>
      <p className="text-gray-500">Logger deg ut...</p>
    </div>
  );
}