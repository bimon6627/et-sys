import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
//import RedirectButton from "@/components/redirect-button";
import RoundedImage from "@/components/rounded-image";
import SignIn from "@/components/sign-in";
import { Metadata } from "next";
import Head from "next/head";

export const metadata: Metadata = {
  title:"Elevtingssystemet",
}

export default function Home() {
  return (
    <div className="relative flex flex-col gap-4 h-screen">
      <Head>
                <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <main className="flex flex-grow items-center justify-center w-full h-full">
        <div className="absolute w-1/2 space-y-3 top-20">
          <h1 className="text-5xl font-bold text-center">Velkommen til Elevtingssystemet!</h1>
          <div className="flex flex-row w-full gap-3">
            <div className="flex flex-col rounded-3xl bg-[#CEDAE2] space-y-3 w-1/2 p-10">
              <h2 className="text-3xl text-center font-semibold">For administratorer</h2>
              <p className="text-center text-xl">Er du en administrator? Logg inn med Google via knappen under. Benytt en konto knyttet til organisasjonen.</p>
              <a className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center cursor-pointer bg-eo-blue text-background gap-2 hover:bg-[#85A2B7] mx-auto text-sm sm:text-base h-10 sm:h-12 px-1 sm:px-2 w-fit">
                <div className="rounded-full bg-background p-1"><RoundedImage src="/assets/Google.png" alt="Google logo" height={30} width={30}/></div>
                <SignIn text="Logg inn med Google" className="font-semibold"/>
              </a>
              <a href="/pages-authorized/" className="text-center hover:underline hover:text-eo-gray">Allerede logget inn?</a>
            </div>

            <div className="flex flex-col rounded-3xl bg-[#FFE0D9] space-y-3 w-1/2 p-10">
              <h2 className="text-3xl text-center font-semibold">For deltakere</h2>
              <p className="text-center text-xl">Er du deltaker? Gå til påmeldingsskjemaet med knappen under!</p>
              {
                //<RedirectButton text={"Påmeldingsskjema"} link={"/"} className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center cursor-pointer bg-eo-orange text-background font-semibold hover:bg-eo-lorange mx-auto text-sm sm:text-base h-10 sm:h-12 px-2 sm:px-3 w-fit"/>
              }
              </div>
          </div>
        </div>
      </main>
        <Footer />
    </div>
  );
}
