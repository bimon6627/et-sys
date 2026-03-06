"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiCog, BiUser, BiShield, BiImport } from "react-icons/bi";

interface SettingsNavigationProps {
  conferenceShortname: string;
}

function getLinks(conferenceShortname: string) {
  const prefix = `/hjem/${conferenceShortname}/innstillinger`;
  const links = [
    {
      href: prefix + "/",
      label: "Konfigurasjon",
      icon: BiCog,
      exact: true,
    },
    {
      href: prefix + "/roller",
      label: "Rollestyring",
      icon: BiShield,
      exact: true,
    },
    {
      href: prefix + "/brukere",
      label: "Brukerstyring",
      icon: BiUser,
      exact: true,
    },
    {
      href: prefix + "/deltakerimport",
      label: "Deltakerimport",
      icon: BiImport,
      exact: true,
    },
  ];
  return links;
}

export default function SettingsSidebar({
  conferenceShortname,
}: SettingsNavigationProps) {
  const pathname = usePathname();
  const links = getLinks(conferenceShortname);
  return (
    <nav className="hidden md:block w-64 p-6 border-r bg-gray-50 flex-shrink-0">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Innstillinger</h2>
      <div className="flex flex-col space-y-2">
        {links.map((link) => {
          // Determine if the link is active
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href) && pathname !== link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-slate-200 font-semibold"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              <link.icon className="size-5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function SettingsFooter({
  conferenceShortname,
}: SettingsNavigationProps) {
  const pathname = usePathname();
  const links = getLinks(conferenceShortname);
  return (
    <nav className="block md:hidden max-w-screen p-6 border-r bg-gray-50 flex-shrink-0">
      <h2 className="text-md font-bold mb-4 text-gray-800">Innstillinger</h2>
      <div className="flex flex-wrap gap-2 space-y-2">
        {links.map((link) => {
          // Determine if the link is active
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href) && pathname !== link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors text-sm ${
                isActive
                  ? "bg-slate-200 font-semibold"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              <link.icon className="size-5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
