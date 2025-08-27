// components/FormClientSection.tsx
"use client";
import { useEffect, useState } from "react";
import { BiCheckCircle } from "react-icons/bi";

export default function RegistrationForm() {
  const [form, setForm] = useState({
    type: "",
    name: "",
    email: "",
    county: "",
    tel: "",
    consent: false,
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    validateForm();
  }, [form]);

  const validateForm = () => {
    const typeValid = form.type == "DELEGATE" || form.type == "OBSERVER";
    const emailValid = form.email.includes("@");
    const nameValid = form.name != "";
    const telValid = /^\d{8}$/.test(form.tel);
    const countyValid = form.county.length > 0;
    const consent = form.consent;

    const isValid =
      typeValid &&
      emailValid &&
      nameValid &&
      telValid &&
      countyValid &&
      consent;

    setIsFormValid(isValid);
    return isValid;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    let newValue: string | boolean = value;

    // Handle checkbox
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      newValue = checked;
    }

    // Update state
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await fetch("/api/form-reply", {
      method: "POST",
      body: JSON.stringify(form),
      headers: {
        "Content-Type": "application/json",
      },
    });

    setIsSubmitting(false);

    if (res.ok) {
      setSubmitted(true);
    } else {
      alert("Error submitting form.");
    }
  };

  return (
    <div className="flex flex-col flex-grow">
      <form
        onSubmit={handleSubmit}
        aria-hidden={submitted}
        className={`flex flex-col flex-grow transition-all duration-300 ease-in-out pt-5 transform ${
          !submitted
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-8 h-0 pointer-events-none overflow-hidden"
        }`}
      >
        <label
          className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4"
          htmlFor="name"
        >
          Fullt navn
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Navn Navnesen"
          value={form.name}
          onChange={handleChange}
        />

        <p className="mt-3 text-gray-500 font-bold mb-1 md:mb-0 pr-4">
          Kontaktinformasjon
        </p>
        <div className="shadow rounded-lg mb-3 p-3 border">
          <div className="md:flex md:items-center">
            <div className="md:w-1/3">
              <label
                className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
                htmlFor="email"
              >
                E-post
              </label>
            </div>
            <div className="md:w-2/3">
              <input
                className="shadow appearance-none border-b py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                name="email"
                placeholder="elev@elev.no"
                required
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="md:flex md:items-center mt-3">
            <div className="md:w-1/3">
              <label
                className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
                htmlFor="tel"
              >
                Telefon
              </label>
            </div>
            <div className="md:w-2/3">
              <input
                className="shadow appearance-none border-b py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="tel"
                type="tel"
                name="tel"
                placeholder="123 45 678"
                onChange={handleChange}
                required
                value={form.tel}
              />
            </div>
          </div>
        </div>

        <label
          className="block text-gray-500 font-bold mt-3 mb-1 md:mb-0 pr-4"
          htmlFor="county"
        >
          Fylke
        </label>
        <input
          id="county"
          name="county"
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Vestland"
          value={form.county}
          onChange={handleChange}
        />

        <div className="w-full md:w-full mb-6 mt-3 md:mb-0">
          <label
            className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4"
            htmlFor="grid-state"
          >
            Skal du være delegat eller observatør?
          </label>
          <div className="relative">
            <select
              name="type"
              id="type"
              value={form.type}
              onChange={handleChange}
              className="block shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="" disabled hidden>
                Vennligst velg
              </option>
              <option value="DELEGATE">Delegat</option>
              <option value="OBSERVER">Observatør</option>
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center mt-8">
          <input
            type="checkbox"
            id="consent"
            name="consent"
            checked={form.consent || false}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="not_returning" className="text-gray-700 font-medium">
            Jeg samtykker til at Elevorganisasjonen behandler disse
            opplysningene.
          </label>
        </div>
        <div className="flex justify-end mt-6">
          <button
            className={`bg-eo-blue text-background font-bold transition-colors py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center ${
              !isFormValid || isSubmitting
                ? "opacity-50 cursor-not-allowed"
                : ""
            } ${isFormValid && !isSubmitting ? "hover:bg-[#85A2B7]" : ""}`}
            type="submit"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg
                  aria-hidden="true"
                  className="w-5 h-5 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-white" // Adjusted size and fill color
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Sender inn...</span>
                Sender inn...
              </>
            ) : (
              "Send inn"
            )}
          </button>
        </div>
      </form>
      <div
        aria-hidden={!submitted}
        className={`overflow-hidden transition-all duration-300 ease-in-out transform w-full ${
          submitted
            ? "opacity-100 translate-y-0 h-auto pointer-events-auto"
            : "opacity-0 translate-y-8 h-0 pointer-events-none overflow-hidden"
        }`}
      >
        <div className="w-full flex flex-col items-center">
          <BiCheckCircle size={70} />
          <h2 className="text-2xl font-bold text-center w-full">
            Vi har mottatt permisjonssøknaden din
          </h2>
          <p>
            Permisjonssøknaden din er mottatt, og vil bli behandlet fortløpende
            og ved behov. Når søknaden er ferdig behandlet, vil du motta
            avgjørelsen på e-postaddressen du oppga. Spørsmål kan rettes til
            Kontrollkomitéen i infokiosk eller på{" "}
            <a
              href="mailto:konkom@elev.no"
              className="text-eo-orange underline hover:opacity-50"
            >
              konkom@elev.no
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
