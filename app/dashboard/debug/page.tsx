import NavbarAuthorized from "@/components/authorized/authorized-navbar";
import GetUserInfo from "@/components/js/get-user-info";

export default async function Dashboard() {
  const user = await GetUserInfo();

  return (
    <div className="bg-white min-w-screen min-h-screen md:flex flex-row">
      <NavbarAuthorized />
      <main className="flex flex-col items-center justify-center w-full h-full p-10 gap-5">
        <h1 className="text-3xl font-bold">Debug Dashboard</h1>

        <div className="p-5 border rounded-lg bg-gray-50 shadow-sm max-w-2xl w-full">
          <h2 className="font-bold text-xl mb-2">User Session Data</h2>
          <p>
            <strong>Name:</strong> {user?.name}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Role:</strong> {user?.role}
          </p>

          <div className="mt-4">
            <strong>Permissions:</strong>
            <div className="flex flex-wrap gap-2 mt-2">
              {user?.permissions?.map((p) => (
                <span
                  key={p}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-mono"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Raw JSON Dump for absolute certainty */}
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs w-full max-w-2xl overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </main>
    </div>
  );
}
