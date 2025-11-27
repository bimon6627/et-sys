import Link from "next/link";
import {
  BiLayout,
  BiColumns,
  BiFile,
  BiPlusMedical,
  BiUser,
  BiCommentDetail,
  BiMobileAlt,
  BiCog,
  BiShield,
  BiInfoCircle,
} from "react-icons/bi";

// 1. Define the structure of a navigation item
type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  permission?: string; // Optional: if missing, everyone sees it
  disabled?: boolean; // For your line-through items
};

// 2. Organize links into groups (to keep your border separators)
const NAV_GROUPS: NavItem[][] = [
  [
    { label: "Dashboard", href: "/dashboard", icon: BiLayout },
    {
      label: "Permisjonssøknader",
      href: "/dashboard/soknader",
      icon: BiColumns,
      permission: "case:read",
    },
    {
      label: "Permisjonsskjema",
      href: "/dashboard/permisjonssoknad",
      icon: BiFile,
    },
    {
      label: "HMS",
      href: "/dashboard/hms",
      icon: BiPlusMedical,
      permission: "hse:read",
    },
    {
      label: "Deltakere",
      href: "/dashboard/deltakere",
      icon: BiUser,
      permission: "participant:read",
    },
  ],
  [
    { label: "Debatt", href: "#", icon: BiCommentDetail, disabled: true },
    { label: "Digital votering", href: "#", icon: BiMobileAlt, disabled: true },
  ],
  [
    { label: "Innstillinger", href: "#", icon: BiCog, disabled: true },
    // 3. The Dynamic Check: This only appears if user has 'admin:view'
    {
      label: "Admin",
      href: "/dashboard/admin",
      icon: BiShield,
      permission: "admin:view",
    },
    { label: "Hjelp", href: "/dashboard/hjelp", icon: BiInfoCircle },
  ],
];

interface AuthorizedNavlinksProps {
  permissions: string[]; // We pass permissions, not just role
}

export default function AuthorizedNavlinks({
  permissions,
}: AuthorizedNavlinksProps) {
  return (
    <div>
      {NAV_GROUPS.map((group, groupIndex) => (
        <div key={groupIndex} className="flex flex-col border-b py-2 gap-2">
          {group.map((link) => {
            // 4. Security Check: If link requires permission user doesn't have, hide it
            if (link.permission && !permissions.includes(link.permission)) {
              return null;
            }

            return (
              <Link
                key={link.label}
                href={link.href}
                // 5. Clean styling logic
                className={`flex items-center w-full gap-1 pl-1 pr-2 py-1 rounded transition-colors ${
                  link.disabled
                    ? "text-gray-400 line-through cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                <link.icon />
                {link.label}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
