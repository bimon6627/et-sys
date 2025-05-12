import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

// app/unauthorized/view/page.tsx
export default function UnauthorizedView() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow text-center mt-20 w-full">
        <h1 className="text-5xl font-bold text-red-600">Adgang avvist</h1>
        <p className="mt-4 text-lg text-gray-700">
          Brukeren du prøvde å logge på med er ikke autorisert.
        </p>
      </main>
      <Footer />
    </div>
  );
}
