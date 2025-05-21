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

export default function AuthorizedNavlinks() {
  return (
    <div>
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
        <a
          href="/dashboard"
          className="flex items-center w-full text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1 pl-1 pr-2 py-1 rounded transition-colors"
        >
          <BiUser />
          Deltakere
        </a>
      </div>
      <div className="flex flex-col border-b py-2 gap-2">
        <a
          href="/dashboard"
          className="flex items-center w-full text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1 pl-1 pr-2 py-1 rounded transition-colors"
        >
          <BiCommentDetail />
          Debatt
        </a>
        <a
          href="/dashboard"
          className="flex items-center w-full text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1 pl-1 pr-2 py-1 rounded transition-colors"
        >
          <BiMobileAlt />
          Digital votering
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
    </div>
  );
}
