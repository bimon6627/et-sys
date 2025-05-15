import navigation from "@/app/data/navigation-public";
import { signOut } from "@/auth";
import React from "react";
import { BiExit } from "react-icons/bi";

interface SignOutProps {
  text: string;
  className?: string;
}
const SignOut: React.FC<SignOutProps> = ({ text, className }) => {
  const home_item = navigation.find((item) => item.name == "Hjem") || {
    name: "Hjem",
    link: "/",
  };
  const link = home_item.link;
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: link });
      }}
    >
      <button type="submit" className={`flex items-center gap-2 ${className}`}>
        <BiExit />
        {text}
      </button>
    </form>
  );
};

export default SignOut;
