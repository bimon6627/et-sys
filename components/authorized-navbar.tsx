import {
  BiCog,
  BiColumns,
  BiFile,
  BiInfoCircle,
  BiLayout,
  BiPlusMedical,
  BiShield,
} from "react-icons/bi";
import GetUserInfo from "./js/get-user-info";
import SignOut from "./sign-out";
import UserAvatar from "./user-avatar";

export default async function NavbarAuthorized() {
  const user = await GetUserInfo();
  const name = user.name ?? "";
  const role = user.role;

  return (
    <nav className="sticky flex flex-col gap-2 top-0 h-screen bg-gray-100 p-2">
      <div className="flex flex-col border-b py-2 gap-2">
        <a
          href="/dashboard"
          className="flex items-center w-full text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1 pl-1 pr-2 py-1 rounded transition-colors"
        >
          <BiLayout />
          Dashboard
        </a>
        <a
          href="/dashboard/soknader"
          className="flex items-center w-full text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1 pl-1 pr-2 py-1 rounded transition-colors"
        >
          <BiColumns />
          Permisjonssøknader
        </a>
        <a
          href="/dashboard/permisjonssoknad"
          className="flex items-center w-full text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1 pl-1 pr-2 py-1 rounded transition-colors"
        >
          <BiFile />
          Permisjonsskjema
        </a>
        <a
          href="/dashboard"
          className="flex items-center w-full text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1 pl-1 pr-2 py-1 rounded transition-colors"
        >
          <BiPlusMedical />
          HMS
        </a>
      </div>
      <div className="flex flex-col border-b py-2 gap-2">
        <a
          href="/dashboard"
          className="flex items-center w-full text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1 pl-1 pr-2 py-1 rounded transition-colors"
        >
          <BiCog />
          Innstillinger
        </a>
        <a
          href="/dashboard/admin"
          className="flex items-center w-full text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1 pl-1 pr-2 py-1 rounded transition-colors"
        >
          <BiShield />
          Admin
        </a>
        <a
          href="/dashboard"
          className="flex items-center w-full text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1 pl-1 pr-2 py-1 rounded transition-colors"
        >
          <BiInfoCircle />
          Hjelp
        </a>
      </div>
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
    </nav>
  );
}
