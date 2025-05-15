import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
//import RedirectButton from "@/components/redirect-button";
import SignIn from "@/components/sign-in";
import { Metadata } from "next";
import Head from "next/head";
import { BiSolidPencil } from "react-icons/bi";

export const metadata: Metadata = {
  title: "Elevtingssystemet",
};

export default function Home() {
  return (
    <div className="relative flex flex-col gap-4 h-screen">
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <main className="flex flex-grow items-center justify-center w-full h-full">
        <div className="lg:absolute md:w-1/2 ml-10 mr-10 space-y-3 top-20">
          <h1 className="lg:text-5xl text-2xl font-bold text-center">
            Velkommen til Elevtingssystemet!
          </h1>
          <div className="flex flex-grow lg:flex-row w-full flex-col gap-3">
            <div className="flex flex-col rounded-3xl bg-[#CEDAE2] space-y-3 w-full lg:w-1/2 p-10">
              <h2 className="lg:text-3xl text-xl text-center font-semibold">
                For administratorer
              </h2>
              <p className="text-center lg:text-xl">
                Er du en administrator? Logg inn med Google via knappen under.
                Benytt en konto knyttet til organisasjonen.
              </p>
              <SignIn />
              <a
                href="/dashboard/"
                className="text-center hover:underline hover:text-eo-gray"
              >
                Allerede logget inn?
              </a>
            </div>

            <div className="flex flex-col rounded-3xl bg-[#FFE0D9] space-y-3 w-full lg:w-1/2  p-10">
              <h2 className="lg:text-3xl text-xl text-center font-semibold">
                For deltakere
              </h2>
              <p className="text-center lg:text-xl">
                Er du deltaker? Gå til permisjonsskjemaet med knappen under!
              </p>
              <a
                href="/permisjonssoknad"
                className="flex items-center gap-1 rounded-full border border-solid border-transparent transition-colors flex items-center justify-center cursor-pointer bg-eo-orange text-background gap-2 hover:bg-eo-lorange mx-auto text-sm md:text-base h-10 sm:h-12 px-1 sm:px-2 w-fit"
              >
                <BiSolidPencil />
                <button className="font-semibold">Søk permisjon</button>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
