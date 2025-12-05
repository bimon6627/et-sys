import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personvernerklæring | Elevtinget",
};

export default function PrivacyPolicyPage() {
  return (
    <div>
        <Navbar />
    <main className="min-h-screen min-w-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto prose prose-blue">
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Personvernerklæring for Elevtinget
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Sist oppdatert: 04.12.2025
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">1. Behandlingsansvarlig</h2>
          <p className="mb-4">
            Elevorganisasjonen er behandlingsansvarlig for personopplysningene som behandles i forbindelse med gjennomføringen av Elevtinget.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2">Kontaktinformasjon:</h3>
            <ul className="list-none space-y-1 pl-0 text-sm text-gray-600">
              <li><strong>Organisasjon:</strong> Elevorganisasjonen</li>
              <li><strong>Adresse:</strong> Christian Kroghs gate 10, 0186 Oslo</li>
              <li><strong>E-post:</strong> <a href="mailto:elev@elev.no" className="text-blue-600 hover:underline">elev@elev.no</a></li>
              <li><strong>Telefon:</strong> 22 99 37 00</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">2. Formålet med behandlingen</h2>
          <p className="mb-4">
            Vi samler inn og behandler personopplysninger for å kunne planlegge, gjennomføre og ivareta sikkerheten under Elevtinget. Konkret brukes opplysningene til:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li><strong>Administrasjon av deltakere:</strong> Registrering, hotellbooking, romfordeling og navneskilt.</li>
            <li><strong>Demokratiske rettigheter:</strong> Verifisering av stemmerett (delegat/observatør-status) og behandling av fullmakter.</li>
            <li><strong>Sikkerhet og HMS:</strong> Håndtering av helse, miljø og sikkerhet under arrangementet, inkludert allergier og medisinske behov.</li>
            <li><strong>Permisjonssøknader:</strong> Behandling av søknader om fravær fra møtet for å sikre vedtaksdyktighet.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">3. Hvilke personopplysninger vi behandler</h2>
          
          <h3 className="font-bold text-gray-800 mt-4 mb-2">Generell informasjon</h3>
          <p className="mb-2">For alle deltakere (delegater, observatører, gjester og mannskap) lagrer vi:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
            <li>Navn</li>
            <li>Kontaktinformasjon (e-post, telefonnummer)</li>
            <li>Skole/Organisasjonstilhørighet og fylke</li>
            <li>Rolle under Elevtinget (f.eks. Delegat, Observatør)</li>
            <li>Fødselsdato (for hotellbooking og aldersgrenser)</li>
            <li>Kjønn (for romfordeling)</li>
          </ul>

          <h3 className="font-bold text-gray-800 mt-4 mb-2">Sensitive personopplysninger (Særlige kategorier)</h3>
          <p className="mb-2">I noen tilfeller behandler vi sensitive opplysninger. Dette gjøres kun når det er strengt nødvendig og basert på ditt samtykke eller vitale interesser:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li><strong>Helseopplysninger:</strong> Informasjon om allergier, dietter eller medisinske behov for tilrettelegging.</li>
            <li><strong>HMS-hendelser:</strong> Rapporter om ulykker, sykdom eller skader som oppstår under arrangementet.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">4. Rettslig grunnlag for behandlingen</h2>
          <p className="mb-4">Behandlingen av dine personopplysninger baserer seg på følgende rettslige grunnlag i personvernforordningen (GDPR):</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li><strong>Avtale (Art. 6 nr. 1 b):</strong> Nødvendig for å oppfylle avtalen om din deltakelse på Elevtinget (hotell, mat, tilgang).</li>
            <li><strong>Berettiget interesse (Art. 6 nr. 1 f):</strong> For å kunne gjennomføre et demokratisk årsmøte og ivareta organisasjonens drift.</li>
            <li><strong>Rettslig forpliktelse (Art. 6 nr. 1 c):</strong> Rapportering og sikkerhetskrav.</li>
            <li><strong>Samtykke (Art. 9 nr. 2 a):</strong> For behandling av helseopplysninger (allergier, HMS, permisjon) innhenter vi uttrykkelig samtykke i søknadsskjemaer.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">5. Hvem har tilgang til dine opplysninger?</h2>
          <p className="mb-2">Vi begrenser tilgangen til personopplysninger internt i systemet:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-4">
            <li><strong>Sekretariatet:</strong> Har tilgang til generell info for logistikk.</li>
            <li><strong>Kontrollkomitéen:</strong> Har tilgang til permisjonssøknader og delegatlister for å godkjenne stemmerett.</li>
            <li><strong>HMS-ansvarlige:</strong> Har tilgang til helseinfo og HMS-logger. Denne tilgangen er strengt begrenset.</li>
          </ul>
          
          <p className="mb-2">Vi deler kun opplysninger med tredjeparter når det er nødvendig:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li><strong>Overnattingssted (Hotell):</strong> Navnelister, fødselsdato, allergier, matpreferanser og romfordeling.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">6. Lagring og sletting</h2>
          <p className="mb-2">Vi lagrer dine personopplysninger så lenge det er nødvendig for formålet med behandlingen.</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li><strong>Generelle deltakerdata:</strong> Slettes eller anonymiseres etter at arrangementet er avsluttet og etterarbeid er ferdigstilt (normalt innen 6 måneder).</li>
            <li><strong>Permisjonssøknader og HMS-rapporter:</strong> Slettes umiddelbart etter at Elevtinget er ferdig, med mindre det foreligger en spesifikk grunn til videre oppbevaring (f.eks. forsikringssaker).</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">7. Dine rettigheter</h2>
          <p className="mb-4">Du har følgende rettigheter knyttet til dine personopplysninger:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-4">
            <li><strong>Innsyn:</strong> Du kan be om en kopi av alle opplysninger vi har lagret om deg.</li>
            <li><strong>Korrigering:</strong> Du kan be oss rette opplysninger som er feil eller misvisende.</li>
            <li><strong>Sletting:</strong> Du kan i visse situasjoner kreve at vi sletter opplysninger om deg ("retten til å bli glemt").</li>
            <li><strong>Begrensning:</strong> Du kan be oss begrense behandlingen av opplysningene dine.</li>
            <li><strong>Dataportabilitet:</strong> Du har rett til å få utlevert dine data i et maskinlesbart format.</li>
            <li><strong>Trekke samtykke:</strong> Hvis behandlingen er basert på samtykke (f.eks. helseopplysninger), kan du når som helst trekke dette tilbake.</li>
          </ul>
          <p className="text-gray-700">
            For å benytte deg av disse rettighetene, ta kontakt med oss på <a href="mailto:teknisk@elev.no" className="text-blue-600 hover:underline">teknisk@elev.no</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">8. Klagerett</h2>
          <p className="text-gray-700">
            Dersom du mener at vi ikke behandler personopplysningene dine i tråd med regelverket, kan du klage til Datatilsynet. Vi oppfordrer deg likevel til å ta kontakt med oss først, så vi kan forsøke å løse saken.
          </p>
        </section>

      </div>
    </main>
    <Footer />
    </div>
  );
}