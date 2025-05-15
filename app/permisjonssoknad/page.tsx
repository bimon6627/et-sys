import Footer from "@/components/footer";
import FormClientSection from "@/components/form-client-section";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Permisjonssøknad",
};

export default function FormPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex flex-grow justify-center mt-10 mb-10 w-full h-full overflow-y-hidden">
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
      </main>
      <Footer />
    </div>
  );
}
