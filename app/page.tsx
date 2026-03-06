import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import SignIn from "@/components/sign-in"; // Assuming you might use this for locked actions
import { Metadata } from "next";
import Head from "next/head";
import Link from "next/link";
import {
  BiCalendar,
  BiMap,
  BiChevronRight,
  BiInfoCircle,
} from "react-icons/bi";

export const metadata: Metadata = {
  title: "Arrangementer | Elevorganisasjonen",
};

// 💡 MOCK DATA: You will replace this with a Prisma fetch later
// e.g., const conferences = await prisma.conference.findMany({ where: { active: true } });
const ACTIVE_CONFERENCES = [
  {
    shortname: "et2026",
    name: "Elevtinget 2026",
    startDate: new Date("2026-03-09"),
    endDate: new Date("2026-03-13"),
    region: "Nasjonalt",
    description:
      "Det 56. ordinære Elevtinget. Elevorganisasjonens øverste organ.",
  },
  {
    shortname: "viken-var-26",
    name: "Fylkestingssamling Viken",
    startDate: new Date("2026-04-15"),
    endDate: new Date("2026-04-17"),
    region: "Viken",
    description: "Vårsamling for alle medlemsskoler i Viken fylke.",
  },
  {
    shortname: "oslo-ar-26",
    name: "Årsmøte Oslo",
    startDate: new Date("2026-05-02"),
    endDate: new Date("2026-05-03"),
    region: "Oslo",
    description: "Årsmøte for Elevorganisasjonen i Oslo.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      {/* 💡 Flex-grow allows the main content to expand, while letting the page scroll naturally */}
      <main className="flex flex-col flex-grow items-center w-full pt-16 pb-24 px-4 sm:px-6">
        {/* Container for content */}
        <div className="w-full max-w-3xl space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4 mb-10">
            <h1 className="text-3xl md:text-5xl font-extrabold text-eo-gray tracking-tight">
              Arrangementer i <br className="hidden md:block" />
              <span className="text-eo-orange">Elevorganisasjonen</span>
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto text-lg">
              Her finner du en oversikt over alle våre aktive og kommende
              samlinger, årsmøter og konferanser.
            </p>
          </div>

          {/* Conference Cards List */}
          <div className="flex flex-col gap-4">
            {ACTIVE_CONFERENCES.length === 0 ? (
              <div className="text-center p-10 bg-white border border-dashed rounded-xl text-gray-500">
                <BiInfoCircle className="size-8 mx-auto mb-2 text-gray-400" />
                Ingen aktive arrangementer for øyeblikket.
              </div>
            ) : (
              ACTIVE_CONFERENCES.map((conf) => (
                <Link
                  key={conf.shortname}
                  href={`/hjem/${conf.shortname}`} // Adjust this link to where public users should go
                  className="group bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    {/* Badge & Title */}
                    <div className="flex items-center gap-3">
                      <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                        {conf.region}
                      </span>
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {conf.name}
                      </h2>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {conf.description}
                    </p>

                    {/* Metadata (Dates) */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 font-medium pt-2">
                      <div className="flex items-center gap-1.5">
                        <BiCalendar className="size-4 opacity-70" />
                        <span>
                          {conf.startDate.toLocaleDateString("no-NO", {
                            day: "2-digit",
                            month: "short",
                          })}{" "}
                          -{" "}
                          {conf.endDate.toLocaleDateString("no-NO", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow Icon indicating it's clickable */}
                  <div className="hidden sm:flex items-center justify-center p-2 rounded-full group-hover:bg-indigo-50 transition-colors">
                    <BiChevronRight className="size-6 text-gray-400 group-hover:text-indigo-600" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
