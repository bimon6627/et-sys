import GetUserInfo from "./js/get-user-info";
import SignOut from "./sign-out";
import UserAvatar from "./user-avatar";
import AuthorizedNavlinks from "./authorized-navlinks";
import NavbarAuthorizedHamburger from "./authorized-navbar-hamburger";

export default async function NavbarAuthorized() {
  const user = await GetUserInfo();
  const name = user.name ?? "";
  const role = user.role ?? "";

  return (
    <nav>
      <NavbarAuthorizedHamburger
        navlinks={<AuthorizedNavlinks role={role} />}
      />
      <div className="hidden md:flex sticky flex-col gap-2 top-0 h-screen bg-gray-100 p-2">
        <AuthorizedNavlinks role={role} />
        <div className="mt-auto gap-2 flex flex-col mb-10">
          <div className="flex flex-row gap-2">
            <UserAvatar />
            <div className="flex flex-col">
              <p className="text-gray-800">{name.split(" ")[0]}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <SignOut />
        </div>
      </div>
    </nav>
  );
}
