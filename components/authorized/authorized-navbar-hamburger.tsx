"use client";

import { BiMenu, BiX } from "react-icons/bi";
import { useState } from "react";
import SignOut from "../sign-out";

interface NavbarAuthorizedHamburgerProps {
  navlinks: React.ReactNode; // This is the "slot" for your Server Component content
  // You no longer need to pass `role` directly to the hamburger,
  // as the role is handled by the `navlinks` content itself.
}

export default function NavbarAuthorizedHamburger({
  navlinks,
}: NavbarAuthorizedHamburgerProps) {
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
        {navlinks}
        <SignOut />
      </div>
    </div>
  );
}
