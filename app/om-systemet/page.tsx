import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import RoundedImage from "@/components/rounded-image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Om Systemet",
};
export default function About() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="flex flex-grow flex-col items-center justify-center h-full w-full pt-5 space-y-5">
        <div className="flex flex-col items-center justify-center space-y-3">
          <RoundedImage
            src="/assets/ETsysMain.png"
            alt="Logo"
            width={200}
            height={200}
          />
          <h1 className="text-5xl font-bold">
            Ett system for en hel konferanse
          </h1>
        </div>

        <div className="rounded-3xl bg-eo-lblue px-20 py-5 w-1/3 space-y-3">
          <h2 className="text-3xl text-center font-semibold">
            Registrering av deltakere
          </h2>
          <p className="text-xl">
            Et Elevting er ingenting uten deltakere. Dette systemet lar
            medlemsskoler og tillitsvalgte melde seg på gjennom et skjema som
            kan tilpasses etter konferansens behov. Påmeldingene er lett å søke
            opp, gå gjennom og godkjenne. Ulike regioner kan defineres, samt om
            de teller mot vedtaksdyktighet, så man slipper å manuellt telle
            delegater.
          </p>
        </div>

        <div className="rounded-3xl bg-eo-lorange px-20 py-5 w-1/3 space-y-3">
          <h2 className="text-3xl text-center font-semibold">Lorem, ipsum.</h2>
          <p className="text-xl">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda
            distinctio quis enim fuga? Sint illum eos, deserunt aliquid velit
            quo nisi doloribus quod sit architecto natus corporis vitae, ratione
            exercitationem hic delectus enim facere dolores laborum esse
            voluptatem itaque voluptatibus? Commodi, dolorem nam cupiditate
            nihil quod deleniti non et quidem quibusdam obcaecati officia ipsum
            omnis asperiores! Accusamus, voluptas eum! Eligendi laudantium rem
            ratione nobis hic, nisi labore vero obcaecati pariatur magnam earum
            at, aut voluptatem dolorum doloribus ab blanditiis sed quasi
            consequuntur dolore, maiores quos soluta. Ipsum, id eveniet hic
            voluptate dolore voluptatem, quae distinctio cum provident, commodi
            natus repudiandae.
          </p>
        </div>

        <div className="rounded-3xl bg-eo-lyellow px-20 py-5 w-1/3 space-y-3">
          <h2 className="text-3xl text-center font-semibold">Lorem, ipsum.</h2>
          <p className="text-xl">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda
            distinctio quis enim fuga? Sint illum eos, deserunt aliquid velit
            quo nisi doloribus quod sit architecto natus corporis vitae, ratione
            exercitationem hic delectus enim facere dolores laborum esse
            voluptatem itaque voluptatibus? Commodi, dolorem nam cupiditate
            nihil quod deleniti non et quidem quibusdam obcaecati officia ipsum
            omnis asperiores! Accusamus, voluptas eum! Eligendi laudantium rem
            ratione nobis hic, nisi labore vero obcaecati pariatur magnam earum
            at, aut voluptatem dolorum doloribus ab blanditiis sed quasi
            consequuntur dolore, maiores quos soluta. Ipsum, id eveniet hic
            voluptate dolore voluptatem, quae distinctio cum provident, commodi
            natus repudiandae.
          </p>
        </div>

        <div className="rounded-3xl bg-eo-lgreen px-20 py-5 w-1/3 space-y-3">
          <h2 className="text-3xl text-center font-semibold">Lorem, ipsum.</h2>
          <p className="text-xl">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda
            distinctio quis enim fuga? Sint illum eos, deserunt aliquid velit
            quo nisi doloribus quod sit architecto natus corporis vitae, ratione
            exercitationem hic delectus enim facere dolores laborum esse
            voluptatem itaque voluptatibus? Commodi, dolorem nam cupiditate
            nihil quod deleniti non et quidem quibusdam obcaecati officia ipsum
            omnis asperiores! Accusamus, voluptas eum! Eligendi laudantium rem
            ratione nobis hic, nisi labore vero obcaecati pariatur magnam earum
            at, aut voluptatem dolorum doloribus ab blanditiis sed quasi
            consequuntur dolore, maiores quos soluta. Ipsum, id eveniet hic
            voluptate dolore voluptatem, quae distinctio cum provident, commodi
            natus repudiandae.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
