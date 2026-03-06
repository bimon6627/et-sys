import Link from "next/link";
import {
  BiLayout,
  BiColumns,
  BiFile,
  BiPlusMedical,
  BiUser,
  BiShield,
  BiInfoCircle,
  BiSolidFilePdf,
  BiHome,
  BiCog,
} from "react-icons/bi";

// --- 1. Define Navigation Data ---
type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
  scope: "global" | "conference"; // Determines which permission list to check
  disabled?: boolean;
};

const NAV_GROUPS: NavItem[][] = [
  // Group 1 (Global)
  [{ label: "Hjem", href: "/hjem", icon: BiHome, scope: "global" }],

  // Group 2 (Conference Specific)
  [
    {
      label: "Dashboard",
      href: "", // Becomes /hjem/[shortname]
      icon: BiLayout,
      scope: "conference",
    },
    {
      label: "Permisjonssøknader",
      href: "/soknader",
      icon: BiColumns,
      permission: "case:read",
      scope: "conference",
    },
    {
      label: "Permisjonsskjema",
      href: "/permisjonssoknad",
      icon: BiFile,
      scope: "conference",
    },
    {
      label: "HMS",
      href: "/hms",
      icon: BiPlusMedical,
      permission: "hse:read",
      scope: "conference",
    },
    {
      label: "Deltakere",
      href: "/deltakere",
      icon: BiUser,
      permission: "participant:read",
      scope: "conference",
    },
    {
      label: "Mine deltakere",
      href: "/deltakere",
      icon: BiUser,
      permission: "participant:regional_read",
      scope: "conference",
    },
    {
      label: "Innstillinger",
      href: "/innstillinger",
      icon: BiCog,
      scope: "conference",
    },
  ],

  // Group 3 (Global)
  [
    {
      label: "Forslagsblekke",
      href: "/forslagsblekke",
      icon: BiSolidFilePdf,
      scope: "global",
    },
  ],

  // Group 4 (Global Admin)
  [
    {
      label: "Admin",
      href: "/admin",
      icon: BiShield,
      permission: "admin:view",
      scope: "global",
    },
    {
      label: "Hjelp",
      href: "/hjelp",
      icon: BiInfoCircle,
      scope: "global",
    },
  ],
];

// --- 2. Update Interface ---
interface AuthorizedNavlinksProps {
  permissions: string[]; // Global permissions
  conferencePermissions: string[]; // specific conference permissions
  shortname?: string;
}

export default function AuthorizedNavlinks({
  permissions,
  conferencePermissions,
  shortname,
}: AuthorizedNavlinksProps) {
  // --- 3. Helper Logic: Is this link allowed? ---
  const isLinkVisible = (link: NavItem) => {
    // A. Scope Check: If conference link, shortname must exist
    if (link.scope === "conference" && !shortname) {
      return false;
    }

    // B. Permission Check:
    // If the link requires a permission...
    if (link.permission) {
      const hasGlobalPermission = permissions.includes(link.permission);
      const hasConfPerm = conferencePermissions.includes(link.permission);
      const isSuperUser = permissions.includes("admin:view");

      if (link.scope === "global") {
        return hasGlobalPermission || isSuperUser;
      }

      // 2. If scope is conference, check conference-specific permissions
      if (link.scope === "conference") {
        return hasGlobalPermission || hasConfPerm;
      }

      return false;
    }

    // If no permission required (and scope check passed), show it
    return true;
  };

  return (
    <div className="flex flex-col gap-4">
      {NAV_GROUPS.map((group, groupIndex) => {
        // Filter links based on visibility logic
        const visibleLinks = group.filter((link) => isLinkVisible(link));

        // If no links in this group are visible, skip rendering the group
        if (visibleLinks.length === 0) return null;

        return (
          <div
            key={groupIndex}
            className="flex flex-col border-b pb-2 gap-1 last:border-b-0"
          >
            {visibleLinks.map((link) => {
              // Build dynamic URL
              let finalHref = link.href;

              // If conference scope, prepend shortname
              // (If global, keep as is, but maybe prepend /hjem if needed based on your routing)
              if (link.scope === "conference") {
                finalHref = `/hjem/${shortname}${link.href}`;
              } else {
                // Assuming global links are under /hjem based on your previous snippet
                // If they are absolute (like /hjem/admin), ensure href in NAV_GROUPS reflects that.
                // Assuming NAV_GROUPS has correct paths now.
                finalHref = `/hjem${link.href === "/hjem" ? "" : link.href}`;
              }

              return (
                <Link
                  key={link.label + link.href}
                  href={finalHref}
                  className={`flex items-center w-full gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                    link.disabled
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                  }`}
                >
                  <link.icon className="text-lg" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
