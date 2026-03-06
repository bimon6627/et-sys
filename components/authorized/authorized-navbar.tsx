import { auth } from "@/auth";
import SignOut from "../sign-out";
import UserAvatar from "../user-avatar";
import AuthorizedNavlinks from "./authorized-navlinks";
import NavbarAuthorizedHamburger from "./authorized-navbar-hamburger";
import { env } from "process";

interface NavbarAuthorizedProps {
  shortname?: string;
}

export default async function NavbarAuthorized({
  shortname,
}: NavbarAuthorizedProps) {
  const session = await auth();
  const user = session?.user;

  const name = user?.name ?? "";
  const email = user?.email ?? "";

  // 1. Get Global Permissions (e.g., "create:conference")
  const globalPermissions = user?.permissions ?? [];

  // 2. Get Conference Specific Permissions
  // We look through the user's organized conferences to see if one matches the current 'shortname'
  const currentConferenceData = user?.organizedConferences?.find(
    (conf) => conf.conferenceShortname === shortname, // Matches the 'shortname' stored in the session
  );

  // If found, extract permissions. If not (or if on a global page), default to empty array.
  const conferencePermissions = currentConferenceData?.permissions ?? [];

  // Optional: Merge them if your Navlinks component needs one combined list
  // const allPermissions = [...new Set([...globalPermissions, ...conferencePermissions])];

  return (
    <nav>
      <NavbarAuthorizedHamburger
        navlinks={
          <AuthorizedNavlinks
            permissions={globalPermissions}
            conferencePermissions={conferencePermissions} // Pass separately
            shortname={shortname}
          />
        }
        name={name}
        email={email}
      />
      <div className="hidden md:flex sticky flex-col gap-2 top-0 h-screen bg-gray-100 p-2">
        <AuthorizedNavlinks
          permissions={globalPermissions}
          conferencePermissions={conferencePermissions} // Pass separately
          shortname={shortname}
        />

        <div className="mt-auto gap-2 flex flex-col mb-10">
          <div className="flex flex-row gap-2 max-w-full">
            <UserAvatar />
            <div className="flex flex-col max-w-full overflow-hidden">
              <p className="text-gray-800">{name.split(" ")[0]}</p>
              <p className="text-sm text-gray-500 truncate">{email}</p>
            </div>
          </div>

          <SignOut />
          <p className="text-xs text-gray-500 px-3">{env.VERSION}</p>
        </div>
      </div>
    </nav>
  );
}
