"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiCog, BiUser, BiShield, BiImport, BiBuilding } from "react-icons/bi";

const adminLinks = [
  {
    href: "/hjem/admin",
    label: "Konfigurasjon",
    icon: BiCog,
    exact: true,
  },
  {
    href: "/hjem/admin/roles",
    label: "Rollestyring",
    icon: BiShield,
    exact: true,
  },
  {
    href: "/hjem/admin/users",
    label: "Brukerstyring",
    icon: BiUser,
    exact: true,
  },
  {
    href: "/hjem/admin/regions",
    label: "Regioner og organisasjoner",
    icon: BiBuilding,
    exact: true,
  },
  {
    href: "/hjem/admin/import",
    label: "Dataimport",
    icon: BiImport,
    exact: true,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:block w-64 p-6 border-r bg-gray-50 flex-shrink-0">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Admin</h2>
      <div className="flex flex-col space-y-2">
        {adminLinks.map((link) => {
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

export function AdminFooter() {
  const pathname = usePathname();

  return (
    <nav className="block md:hidden max-w-screen p-6 border-r bg-gray-50 flex-shrink-0">
      <h2 className="text-md font-bold mb-4 text-gray-800">Admin</h2>
      <div className="flex flex-wrap gap-2 space-y-2">
        {adminLinks.map((link) => {
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
