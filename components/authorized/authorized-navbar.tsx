import { auth } from "@/auth"; // Import the auth helper directly
import SignOut from "../sign-out";
import UserAvatar from "../user-avatar";
import AuthorizedNavlinks from "./authorized-navlinks";
import NavbarAuthorizedHamburger from "./authorized-navbar-hamburger";

export default async function NavbarAuthorized() {
  // 1. Fetch the session directly
  const session = await auth();
  const user = session?.user;

  // 2. Safe extraction of variables
  const name = user?.name ?? "";
  const email = user?.email ?? "";

  // 3. Get permissions (Defaults to empty array if user is null)
  const permissions = user?.permissions ?? [];

  return (
    <nav>
      <NavbarAuthorizedHamburger
        // 4. Pass permissions instead of role
        navlinks={<AuthorizedNavlinks permissions={permissions} />}
      />
      <div className="hidden md:flex sticky flex-col gap-2 top-0 h-screen bg-gray-100 p-2">
        {/* 4. Pass permissions instead of role */}
        <AuthorizedNavlinks permissions={permissions} />

        <div className="mt-auto gap-2 flex flex-col mb-10">
          <div className="flex flex-row gap-2 max-w-full">
            <UserAvatar />
            <div className="flex flex-col max-w-full overflow-hidden">
              <p className="text-gray-800">{name.split(" ")[0]}</p>
              <p className="text-sm text-gray-500 truncate">{email}</p>
            </div>
          </div>

          <SignOut />
        </div>
      </div>
    </nav>
  );
}
