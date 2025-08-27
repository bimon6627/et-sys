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

interface AuthorizedNavlinksProps {
  slug: string;
  role: string; // The role is expected to be a string
}

export default async function AuthorizedNavlinks({
  slug,
  role,
}: AuthorizedNavlinksProps) {
  const prefix = "/dashboard/" + slug + "/";
  return (
    <div>
      <div className="flex flex-col border-b py-2 gap-2">
        <Link
          href={prefix}
          className="flex items-center w-full text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1 pl-1 pr-2 py-1 rounded transition-colors"
        >
          <BiLayout />
          Dashboard
        </Link>
        <Link
          href={prefix + "soknader"}
          className="flex items-center w-full text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1 pl-1 pr-2 py-1 rounded transition-colors"
        >
          <BiColumns />
          Permisjonssøknader
        </Link>
        <Link
          href={prefix + "permisjonssoknad"}
          className="flex items-center w-full text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1 pl-1 pr-2 py-1 rounded transition-colors"
        >
          <BiFile />
          Permisjonsskjema
        </Link>
        <Link
          href={prefix}
          className="line-through flex items-center w-full text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1 pl-1 pr-2 py-1 rounded transition-colors"
        >
          <BiPlusMedical />
          HMS
        </Link>
        <Link
          href={prefix}
          className="line-through flex items-center w-full text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1 pl-1 pr-2 py-1 rounded transition-colors"
        >
          <BiUser />
          Deltakere
        </Link>
      </div>
      <div className="flex flex-col border-b py-2 gap-2">
        <Link
          href="/dashboard"
          className="line-through flex items-center w-full text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1 pl-1 pr-2 py-1 rounded transition-colors"
        >
          <BiCommentDetail />
          Debatt
        </Link>
        <Link
          href="/dashboard"
          className="line-through flex items-center w-full text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1 pl-1 pr-2 py-1 rounded transition-colors"
        >
          <BiMobileAlt />
          Digital votering
        </Link>
      </div>
      <div className="flex flex-col border-b py-2 gap-2">
        <Link
          href="/dashboard"
          className="line-through flex items-center w-full text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1 pl-1 pr-2 py-1 rounded transition-colors"
        >
          <BiCog />
          Innstillinger
        </Link>
        {role == "ADMIN" ? (
          <Link
            href="/dashboard/admin"
            className="flex items-center w-full text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1 pl-1 pr-2 py-1 rounded transition-colors"
          >
            <BiShield />
            Admin
          </Link>
        ) : (
          <></>
        )}
        <Link
          href="/dashboard"
          className="line-through flex items-center w-full text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1 pl-1 pr-2 py-1 rounded transition-colors"
        >
          <BiInfoCircle />
          Hjelp
        </Link>
      </div>
    </div>
  );
}
