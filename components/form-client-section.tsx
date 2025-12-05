"use client";

import { useEffect, useRef, useState } from "react";
import {
  BiCheckCircle,
  BiInfoCircle,
  BiUser,
  BiIdCard,
  BiPhone,
  BiEnvelope,
} from "react-icons/bi";
import {
  submitApplication,
  getEventDuration,
  getRegions,
} from "@/app/actions/form-actions";

type DayOption = { value: number; label: string };
type RegionOption = { id: number; name: string };

export default function FormClientSection() {
  // --- Refs for Animations ---
  const toSectionRef = useRef<HTMLDivElement>(null);
  const observerCheckboxRef = useRef<HTMLDivElement>(null);
  const observerDetailsRef = useRef<HTMLDivElement>(null);

  // --- Layout State ---
  const [toSectionHeight, setToSectionHeight] = useState<string | number>(
    "auto"
  );
  const [observerCheckboxHeight, setObserverCheckboxHeight] = useState<
    string | number
  >(0);
  const [observerDetailsHeight, setObserverDetailsHeight] = useState<
    string | number
  >(0);

  // --- Form State (All Manual Inputs) ---
  const [form, setForm] = useState({
    type: "",
    id: "", // Skiltnummer
    name: "",
    email: "",
    county: "",
    tel: "",
    from_day: "",
    from_time: "00:00",
    to_day: "",
    to_time: "00:00",
    has_observer: false,
    not_returning: false,
    reason: "",
    observer_name: "",
    observer_id: "",
    observer_tel: "",
    consent: false,
  });

  // --- Logic State ---
  const [showToSection, setShowToSection] = useState(true);

  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // --- Dynamic Dates State ---
  const [dayOptions, setDayOptions] = useState<DayOption[]>([]);
  const [regionOptions, setRegionOptions] = useState<RegionOption[]>([]);
  const [loadingDates, setLoadingDates] = useState(true);
  const [loadingRegions, setLoadingRegions] = useState(true);

  // --- 1. LOAD DYNAMIC DATES ---
  useEffect(() => {
    async function loadDays() {
      const { start, end } = await getEventDuration();
      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const options: DayOption[] = [];

        // Normalize time to ensure loop works correctly
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        const current = new Date(startDate);
        let offset = 0;

        while (current <= endDate) {
          const dayName = current.toLocaleDateString("no-NO", {
            weekday: "long",
          });
          const label = dayName.charAt(0).toUpperCase() + dayName.slice(1);
          options.push({ value: offset, label });

          current.setDate(current.getDate() + 1);
          offset++;
          if (offset > 14) break; // Safety break
        }
        setDayOptions(options);
      }
      setLoadingDates(false);
    }
    loadDays();
  }, []);

  useEffect(() => {
    async function loadRegions() {
      const regions = getRegions();
      setRegionOptions(await regions);
      setLoadingRegions(false);
    }
    loadRegions();
  }, []);

  // --- 2. HANDLERS ---
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    let newValue: string | boolean = value;

    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    }

    // Formatting: Only numbers for ID and Phone
    if (name === "tel" || name === "observer_tel") {
      newValue = value.replace(/\D/g, "").slice(0, 8);
    }
    if (name === "id" || name === "observer_id") {
      newValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Server Action handles validation and linking logic
      const result = await submitApplication(form);

      if (result.success) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // Server returned a logic error (e.g. "Participant not found")
        alert(result.message || "Feil ved innsending.");
      }
    } catch (error) {
      console.error(error);
      alert("Kritisk feil ved innsending.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. ANIMATION EFFECTS ---
  useEffect(() => {
    setShowToSection(!form.not_returning);
  }, [form.not_returning]);

  useEffect(() => {
    if (toSectionRef.current) {
      setToSectionHeight(showToSection ? toSectionRef.current.scrollHeight : 0);
    }
  }, [showToSection]);

  useEffect(() => {
    if (form.type === "DELEGATE") {
      if (observerCheckboxRef.current)
        setObserverCheckboxHeight(observerCheckboxRef.current.scrollHeight);
    } else {
      setObserverCheckboxHeight(0);
    }
  }, [form.type]);

  useEffect(() => {
    if (form.type === "DELEGATE" && form.has_observer) {
      if (observerDetailsRef.current)
        setObserverDetailsHeight(observerDetailsRef.current.scrollHeight);
    } else {
      setObserverDetailsHeight(0);
    }
  }, [form.type, form.has_observer]);

  // --- 4. FORM VALIDATION ---
  useEffect(() => {
    const has_observer = form.has_observer && form.type === "DELEGATE";

    // Basic Field Checks
    const basicInfoValid =
      form.name.length > 2 &&
      form.email.includes("@") &&
      /^\d{1,4}$/.test(form.id) && // Skiltnummer must be 1-4 digits
      /^\d{8}$/.test(form.tel) &&
      form.county.length > 2 &&
      form.type !== "";

    // Leave Details Checks
    const leaveValid =
      form.from_day !== "" &&
      (form.not_returning || form.to_day !== "") &&
      form.reason.length > 5;

    // Observer Checks (only if active)
    const observerValid =
      !has_observer ||
      (form.observer_name.length > 2 &&
        /^\d{1,4}$/.test(form.observer_id) &&
        /^\d{8}$/.test(form.observer_tel));

    console.log(basicInfoValid && leaveValid && observerValid && form.consent);
    setIsFormValid(
      basicInfoValid && leaveValid && observerValid && form.consent
    );
  }, [form]);

  // --- RENDER ---
  return (
    <div className="flex flex-col flex-grow">
      <form
        onSubmit={handleSubmit}
        aria-hidden={submitted}
        className={`flex flex-col flex-grow transition-all duration-300 ease-in-out transform ${
          !submitted
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-8 h-0 pointer-events-none overflow-hidden"
        }`}
      >
        {/* --- SECTION 1: PERSONALIA (MANUAL ENTRY) --- */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
            <BiUser className="text-eo-blue" /> Personalia
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <label className="block text-gray-600 font-bold mb-1 text-sm">
                Fullt Navn
              </label>
              <div className="relative">
                <BiUser className="absolute top-3 left-3 text-gray-400 size-5" />
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-eo-blue outline-none transition-shadow"
                  required
                  placeholder="Navn Navnesen"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-600 font-bold mb-1 text-sm">
                E-post
              </label>
              <div className="relative">
                <BiEnvelope className="absolute top-3 left-3 text-gray-400 size-5" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-eo-blue outline-none transition-shadow"
                  required
                  placeholder="din@epost.no"
                />
              </div>
            </div>

            {/* Skiltnummer */}
            <div>
              <label className="block text-gray-600 font-bold mb-1 text-sm">
                Skiltnummer
              </label>
              <div className="relative">
                <BiIdCard className="absolute top-3 left-3 text-gray-400 size-5" />
                <input
                  name="id"
                  value={form.id}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-eo-blue outline-none transition-shadow"
                  required
                  placeholder="1234"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-600 font-bold mb-1 text-sm">
                Telefon
              </label>
              <div className="relative">
                <BiPhone className="absolute top-3 left-3 text-gray-400 size-5" />
                <input
                  type="tel"
                  name="tel"
                  value={form.tel}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-eo-blue outline-none transition-shadow"
                  required
                  placeholder="12345678"
                />
              </div>
            </div>

            {/* County */}
            <div>
              <label className="block text-gray-600 font-bold mb-1 text-sm">
                Fylke / Region
              </label>
              <div className="relative">
                <select
                  name="county"
                  value={form.county}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg bg-white appearance-none focus:ring-2 focus:ring-eo-blue outline-none"
                  disabled={loadingRegions}
                >
                  <option value="" disabled hidden>
                    {loadingRegions ? "Laster..." : "Velg Fylke"}
                  </option>
                  {regionOptions.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Status Type */}
            <div>
              <label className="block text-gray-600 font-bold mb-1 text-sm">
                Er du delegat?
              </label>
              <div className="relative">
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg bg-white appearance-none focus:ring-2 focus:ring-eo-blue outline-none"
                  required
                >
                  <option value="" disabled hidden>
                    Velg...
                  </option>
                  <option value="DELEGATE">Delegat</option>
                  <option value="OBSERVER">Observatør</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION 2: LEAVE DETAILS --- */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
            <BiInfoCircle className="text-eo-blue" /> Permisjonsdetaljer
          </h3>

          <div className="space-y-6">
            {/* FROM Date */}
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-sm">
                Når trenger du permisjon fra?
              </label>
              <div className="flex gap-4">
                <select
                  name="from_day"
                  value={form.from_day}
                  onChange={handleChange}
                  className="w-1/2 p-3 border rounded-lg bg-white focus:ring-2 focus:ring-eo-blue outline-none disabled:bg-gray-50"
                  disabled={loadingDates}
                >
                  <option value="" disabled hidden>
                    {loadingDates ? "Laster..." : "Velg dag"}
                  </option>
                  {dayOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  name="from_time"
                  value={form.from_time}
                  onChange={handleChange}
                  className="w-1/2 p-3 border rounded-lg focus:ring-2 focus:ring-eo-blue outline-none"
                  required
                />
              </div>
            </div>

            {/* TO Date (Conditional Animation) */}
            <div
              ref={toSectionRef}
              style={{ height: toSectionHeight }}
              className={`transition-all duration-300 overflow-hidden ${
                !showToSection ? "opacity-50" : ""
              }`}
            >
              <label className="block text-gray-700 font-bold mb-2 text-sm">
                Når trenger du permisjon til?
              </label>
              <div className="flex gap-4">
                <select
                  name="to_day"
                  value={form.to_day}
                  onChange={handleChange}
                  className="w-1/2 p-3 border rounded-lg bg-white focus:ring-2 focus:ring-eo-blue outline-none disabled:bg-gray-50"
                  disabled={!showToSection || loadingDates}
                >
                  <option value="" disabled hidden>
                    {loadingDates ? "Laster..." : "Velg dag"}
                  </option>
                  {dayOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  name="to_time"
                  value={form.to_time}
                  onChange={handleChange}
                  className="w-1/2 p-3 border rounded-lg focus:ring-2 focus:ring-eo-blue outline-none"
                  disabled={!showToSection}
                  required={!form.not_returning}
                />
              </div>
            </div>

            {/* Not Returning Checkbox */}
            <div className="flex items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
              <input
                type="checkbox"
                name="not_returning"
                id="not_returning"
                checked={form.not_returning}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
              />
              <label
                htmlFor="not_returning"
                className="ml-3 text-gray-700 font-medium cursor-pointer select-none"
              >
                Jeg trenger permisjon ut møtet (kommer ikke tilbake)
              </label>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-sm">
                Årsak
              </label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                rows={4}
                placeholder="Beskriv årsaken til permisjonen her..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-eo-blue outline-none resize-none"
                required
              />
            </div>
          </div>
        </div>

        {/* --- SECTION 3: OBSERVER (Conditional) --- */}
        <div
          ref={observerCheckboxRef}
          style={{ height: observerCheckboxHeight }}
          className="overflow-hidden transition-all duration-300 mb-6"
        >
          <div className="flex items-center bg-gray-50 p-3 rounded-lg border">
            <input
              type="checkbox"
              name="has_observer"
              id="has_observer"
              checked={form.has_observer}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <label
              htmlFor="has_observer"
              className="ml-3 text-gray-700 font-medium cursor-pointer select-none flex-grow"
            >
              Jeg har en observatør som skal bli delegat
            </label>
            <div className="group relative ml-2">
              <BiInfoCircle className="text-gray-400 hover:text-eo-blue cursor-help size-5" />
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                Kryss av hvis en observatør overtar din plass. Ikke kryss av
                hvis observatøren også skal være borte.
              </div>
            </div>
          </div>
        </div>

        <div
          ref={observerDetailsRef}
          style={{ height: observerDetailsHeight }}
          className="overflow-hidden transition-all duration-300 mb-6"
        >
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4">
            <h4 className="font-bold text-gray-700 flex items-center gap-2">
              <BiUser className="size-4" /> Observatør Informasjon
            </h4>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Fullt navn
              </label>
              <input
                name="observer_name"
                value={form.observer_name}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Skiltnummer
                </label>
                <input
                  name="observer_id"
                  value={form.observer_id}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Telefon
                </label>
                <input
                  name="observer_tel"
                  type="tel"
                  value={form.observer_tel}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- SUBMIT --- */}
        <div className="flex items-start pt-6 border-t">
          <input
            type="checkbox"
            name="consent"
            id="consent"
            checked={form.consent}
            onChange={handleChange}
            className="w-5 h-5 mt-1 text-blue-600 rounded cursor-pointer"
          />
          <label
            htmlFor="consent"
            className="ml-2 text-gray-600 text-sm cursor-pointer select-none"
          >
            Jeg samtykker til at Elevorganisasjonen behandler disse
            opplysningene. <a href="/personvern" target="_blank" className="text-blue-600 underline ml-1">
    Les personvernerklæringen her.
  </a>
          </label>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`px-8 py-3 rounded-lg font-bold text-white transition-all shadow-md flex items-center gap-2 ${
              !isFormValid || isSubmitting
                ? "bg-gray-400 cursor-not-allowed shadow-none"
                : "bg-eo-blue hover:bg-blue-700 hover:shadow-lg"
            }`}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sender inn...
              </>
            ) : (
              "Send søknad"
            )}
          </button>
        </div>
      </form>

      {/* --- SUCCESS VIEW --- */}
      <div
        aria-hidden={!submitted}
        className={`overflow-hidden transition-all duration-500 ease-in-out transform w-full ${
          submitted ? "opacity-100 h-auto" : "opacity-0 h-0"
        }`}
      >
        <div className="w-full flex flex-col items-center py-12 text-center">
          <div className="bg-green-100 p-5 rounded-full mb-6 animate-bounce-short">
            <BiCheckCircle size={64} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Søknad Mottatt!
          </h2>
          <p className="text-gray-600 max-w-md mx-auto mb-8 text-lg leading-relaxed">
            Din permisjonssøknad er registrert. <br />
            Du vil motta svar på <strong>{form.email}</strong> når den er ferdig
            behandlet.
          </p>
          <a
            href="mailto:konkom@elev.no"
            className="text-eo-blue font-semibold hover:underline flex items-center gap-2"
          >
            <BiInfoCircle /> Har du spørsmål? Kontakt konkom@elev.no
          </a>
        </div>
      </div>
    </div>
  );
}
