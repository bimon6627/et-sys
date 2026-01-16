import { auth } from "@/auth";
import { redirect } from "next/navigation";
import NavbarAuthorized from "@/components/authorized/authorized-navbar";
import PdfGeneratorForm from "@/components/pdf/pdf-generator-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forslagsblekke",
};

export default async function AdminPdfPage() {
  const session = await auth();
  const permissions = session?.user?.permissions || [];

  if (!permissions.includes("admin:view")) {
    redirect("/unauthorized");
  }

  return (
    <div className="flex md:flex-row min-h-screen bg-gray-50">
      <NavbarAuthorized />
      <div className="p-8 w-full max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Dokumentgenerering</h1>
        <PdfGeneratorForm />
      </div>
    </div>
  );
}