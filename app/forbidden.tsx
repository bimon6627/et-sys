import Link from "next/link";

export default function Forbidden() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
      <p>You do not have the required permissions to view this page.</p>
      <Link
        href="/dashboard"
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Return Home
      </Link>
    </div>
  );
}
