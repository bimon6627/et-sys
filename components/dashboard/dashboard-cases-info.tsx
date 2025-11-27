import { prisma } from "@/lib/prisma";
import { BiBuilding, BiUserVoice } from "react-icons/bi";

export default async function DashboardInfo() {
  const [uniqueCheckedInDelegates] = await Promise.all([
    prisma.organization.count({
      where: {
        participants: {
          some: {
            type: "DELEGATE",
            checked_in: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Permisjonssøknader</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase">
              Antall aktive Permisjonssøknader
            </p>
            <p className="text-3xl font-bold text-gray-900"></p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full">
            <BiBuilding className="size-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase">
              Antall Delegater
            </p>
            <span className="flex flex-row gap-2 items-end"></span>
          </div>
          <div className="p-3 bg-green-50 rounded-full">
            <BiUserVoice className="size-8 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
