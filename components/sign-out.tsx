"use client";
import { signOut } from "next-auth/react";
import { BiLogOut } from "react-icons/bi";
import { useRouter } from "next/navigation"; // Import useRouter

export default function SignOut() {
  const router = useRouter(); // Initialize the router

  const handleSignOut = async () => {
    await signOut({ redirect: false }); // Prevent the default redirect
    router.push("/"); // Programmatically redirect to the homepage
  };

  return (
    <button
      className={`flex items-center gap-2 text-gray-700 hover:bg-gray-200 w-full hover:text-gray-900 pl-1 pr-2 py-1 rounded transition-colors"`}
      onClick={handleSignOut}
    >
      <BiLogOut />
      Logg ut
    </button>
  );
}
