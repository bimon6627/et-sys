"use client";

import { BiMenu, BiX, BiLogOut } from "react-icons/bi";
import { useState, useEffect } from "react";
import SignOut from "../sign-out";
import UserAvatar from "../user-avatar";

interface NavbarAuthorizedHamburgerProps {
  navlinks: React.ReactNode;
  name: string;
  email: string;
}

export default function NavbarAuthorizedHamburger({
  navlinks,
  name,
  email,
}: NavbarAuthorizedHamburgerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  return (
    <>
      {/* 1. MOBILE TOP BAR (The Fix)
        - relative: Sits in the document flow (pushes content down)
        - md:hidden: Disappears on desktop
        - z-50: Ensures menu stays on top if we make it sticky later
      */}
      <div className="md:hidden sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-50 shadow-sm">
        {/* Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 -ml-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Toggle Menu"
        >
          {isOpen ? <BiX className="size-6" /> : <BiMenu className="size-6" />}
        </button>

        {/* User Profile Container */}
        <div className="flex items-center gap-3 min-w-0 pl-4">
          {/* Text Details */}
          <div className="flex flex-col items-end min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate w-full text-right">
              {name.split(" ")[0]}
            </p>
            <p className="text-xs text-gray-500 truncate w-full text-right">
              {email}
            </p>
          </div>

          {/* Avatar */}
          <div className="flex-shrink-0">
            <UserAvatar />
          </div>
        </div>
      </div>

      {/* 2. BACKDROP OVERLAY */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 3. SIDE DRAWER */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b flex items-center justify-between bg-gray-50">
          <h2 className="font-bold text-lg text-gray-800">Meny</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md hover:bg-gray-200 text-gray-500"
          >
            <BiX className="size-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-2" onClick={() => setIsOpen(false)}>
            {navlinks}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-50 text-red-700 w-full cursor-pointer">
            <BiLogOut className="size-5" />
            <div className="flex-grow font-medium">
              <SignOut />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
