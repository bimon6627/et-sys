import React from "react";
import NavbarAuthorized from "@/components/authorized-navbar";
import FormClientSection from "@/components/form-client-section";
import { Metadata } from "next";
import NavbarAuthorizedHamburger from "@/components/authorized-navbar-hamburger";

export const metadata: Metadata = {
  title: "Søknadsskjema",
};

export default async function AuthFormPage() {
  return (
    <div className="min-w-screen min-h-screen md:flex flex-row">
      <NavbarAuthorizedHamburger />
      <NavbarAuthorized />
      <main className="flex flex-row flex-grow items-center justify-center w-full h-full p-6 md:p-10">
        <div className="flex flex-grow justify-center mt-10 mb-10 w-full h-full overflow-y-hidden">
          <div className="w-full max-w-2xl mx-auto space-y-3 top-20 px-4">
            <div>
              <div className="rounded-t-lg bg-eo-blue pt-3"></div>
              <h1 className="md:text-5xl text-3xl font-bold text-center rounded-b-lg p-5 bg-[#FFFFFF]">
                Permisjonssøknad
              </h1>
            </div>

            <div className="flex flex-row w-full">
              <div className="flex flex-col flex-grow rounded-lg bg-[#FFFFFF] p-10 w-full">
                <FormClientSection />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
