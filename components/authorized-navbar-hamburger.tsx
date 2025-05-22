"use client";

import { BiMenu, BiX } from "react-icons/bi";
import { useState } from "react";
import AuthorizedNavlinks from "./authorized-navlinks";
import SignOut from "./sign-out";

interface AuthorizedNavlinksProps {
  role: string; // The role is expected to be a string
}

export default function NavbarAuthorizedHamburger({
  role,
}: AuthorizedNavlinksProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex md:hidden top-0 z-20 sticky">
      <button onClick={toggleMenu} className="hover:bg-gray-200 rounded-br-md">
        {isOpen ? <BiX className="size-6" /> : <BiMenu className="size-6" />}
      </button>
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } absolute top-full left-0 bg-white shadow-md rounded-md z-10 w-full`}
      >
        <AuthorizedNavlinks role={role} />
        <SignOut />
      </div>
    </div>
  );
}
