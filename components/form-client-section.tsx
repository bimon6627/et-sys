// components/FormClientSection.tsx
"use client";

import { prisma } from "@/lib/prisma";
import { useEffect, useState } from "react";
import { BiInfoCircle } from "react-icons/bi";

interface FormClientSectionProps {}

export async function getServerSideProps() {
  const config = await prisma.config.findUnique({
    where: { key: "startDate" },
  });

  return {
    props: {
      startDate: config?.value ?? null,
    },
  };
}

export default function FormClientSection({}: FormClientSectionProps) {
  const startDate = new Date();
  const [form, setForm] = useState({
    type: "",
    id: "",
    name: "",
    email: "",
    county: "",
    from_day: "",
    from_time: "00:00",
    to_day: "",
    to_time: "00:00",
    tel: "",
    has_observer: false,
    not_returning: false,
    reason: "",
    observer_name: "",
    observer_id: "",
    observer_tel: "",
  });

  const [showToSection, setShowToSection] = useState(true);
  const [showObserverCheckbox, setShowObserverCheckbox] = useState(false);
  const [showObserverDetails, setShowObserverDetails] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setShowToSection(!form.not_returning);
  }, [form.not_returning]);

  useEffect(() => {
    if (form.type === "DELEGATE" && form.has_observer) {
      setShowObserverDetails(true);
    } else {
      setShowObserverDetails(false);
    }
  }, [form.type, form.has_observer]);

  useEffect(() => {
    if (form.type === "DELEGATE") {
      setShowObserverCheckbox(true);
    } else {
      setShowObserverCheckbox(false);
    }
  });

  useEffect(() => {
    validateForm();
  }, [form]);

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let has_observer = form.has_observer && form.type == "DELEGATE";
    const idValid = /^\d{1,4}$/.test(form.id);
    const typeValid = form.type == "DELEGATE" || form.type == "OBSERVER";
    const emailValid = form.email.includes("@");
    const nameValid = form.name != "";
    const telValid = /^\d{8}$/.test(form.tel);
    const countyValid = form.county.length > 0;
    const from_dayValid = form.from_day != "";
    const to_dayValid = form.to_day != "" || form.not_returning;
    const reasonValid = form.reason != "";
    const observer_nameValid = form.observer_name != "" || !has_observer;
    const observer_idValid =
      /^\d{1,4}$/.test(form.observer_id) || !has_observer;
    const observer_telValid =
      /^\d{8}$/.test(form.observer_tel) || !has_observer;

    const isValid =
      idValid &&
      typeValid &&
      emailValid &&
      nameValid &&
      telValid &&
      countyValid &&
      from_dayValid &&
      to_dayValid &&
      reasonValid &&
      observer_nameValid &&
      observer_idValid &&
      observer_telValid;

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

    // Example: Validate phone number format (Norwegian mobile format)
    if (name === "tel" || name === "observer_tel") {
      const phoneRegex = /\d{7}$/;
      newValue = value.replace(/\D/g, "").slice(0, 8);
    }

    if (name === "id" || name === "observer_id") {
      const idRegex = /^\d{1,4}$/;
      newValue = value.replace(/\D/g, "").slice(0, 4);
    }

    // Update state
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/form-reply", {
      method: "POST",
      body: JSON.stringify(form),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      alert("Form submitted!");
    } else {
      alert("Error submitting form.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
      <label
        className="block text-gray-500 font-bold mt-3 mb-1 md:mb-0 pr-4"
        htmlFor="id"
      >
        Skiltnummer
      </label>
      <input
        id="id"
        name="id"
        required
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        placeholder="1234"
        value={form.id}
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
          Er du delegat eller observatør?
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

      <div
        className={`flex items-center mt-4 transition-all duration-500 ease-in-out transform ${
          showObserverCheckbox
            ? "opacity-100 translate-y-0 max-h-[1000px] pointer-events-auto"
            : "opacity-0 translate-y-8 max-h-0 pointer-events-none"
        }`}
      >
        <input
          type="checkbox"
          id="has_observer"
          name="has_observer"
          checked={form.has_observer || false}
          onChange={handleChange}
          className="mr-2"
        />
        <label htmlFor="has_observer" className="text-gray-700 font-medium">
          Jeg har en observatør som skal bli delegat
        </label>
        <div className="relative group">
          <BiInfoCircle className="ml-3 text-gray-700" />
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-500 text-white text-sm rounded px-2 py-1 mt-2">
            Kryss av denne boksen hvis du har en observatør som skal overta
            delegatstatus. Hvis observatøren din skal være borte samtidig som
            deg, skal du ikke krysse av boksen.
          </div>
        </div>
      </div>

      <div className="w-full md:w-full mb-6 mt-3 md:mb-0">
        <label
          className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4"
          htmlFor="grid-state"
        >
          Når trenger du permisjon fra?
        </label>
        <div className="md:flex md:items-center">
          <div className="relative w-1/2 mr-2">
            <select
              name="from_day"
              id="from_day"
              value={form.from_day}
              onChange={handleChange}
              className="block shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="" disabled hidden>
                Vennligst velg
              </option>
              <option value="0">Mandag</option>
              <option value="1">Tirsdag</option>
              <option value="2">Onsdag</option>
              <option value="3">Torsdag</option>
              <option value="4">Fredag</option>
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
          <div className="relative w-1/2">
            <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="time"
              id="from_time"
              name="from_time"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={form.from_time}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      <div
        aria-hidden={!showToSection}
        className={`overflow-hidden transition-all duration-300 mt-3 ease-in-out transform ${
          showToSection
            ? "opacity-100 translate-y-0 max-h-[1000px] pointer-events-auto"
            : "opacity-0 translate-y-8 max-h-0 pointer-events-none"
        }`}
      >
        <label
          className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4"
          htmlFor="grid-state"
        >
          Når trenger du permisjon til?
        </label>
        <div className="md:flex md:items-center">
          <div className="relative w-1/2 mr-2">
            <select
              name="to_day"
              id="to_day"
              value={form.to_day}
              onChange={handleChange}
              className="block shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="" disabled hidden>
                Vennligst velg
              </option>
              <option value="0">Mandag</option>
              <option value="1">Tirsdag</option>
              <option value="2">Onsdag</option>
              <option value="3">Torsdag</option>
              <option value="4">Fredag</option>
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
          <div className="relative w-1/2">
            <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="time"
              id="to_time"
              name="to_time"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={form.to_time}
              onChange={handleChange}
              required={showToSection}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center mt-4">
        <input
          type="checkbox"
          id="not_returning"
          name="not_returning"
          checked={form.not_returning || false}
          onChange={handleChange}
          className="mr-2"
        />
        <label htmlFor="not_returning" className="text-gray-700 font-medium">
          Jeg trenger permisjon ut møtet
        </label>
      </div>
      <label
        className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4 mt-3"
        htmlFor="reason"
      >
        Årsak for permisjon
      </label>
      <textarea
        name="reason"
        id="reason"
        placeholder="Skriv årsaken til permisjonen her..."
        value={form.reason}
        onChange={handleChange}
        rows={5}
        required
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none"
      />

      <div
        aria-hidden={!showObserverDetails}
        className={`overflow-hidden transition-all duration-300 ease-in-out transform ${
          showObserverDetails
            ? "opacity-100 translate-y-0 max-h-[1000px] pointer-events-auto"
            : "opacity-0 translate-y-8 max-h-0 pointer-events-none"
        }`}
      >
        <p className="mt-3 text-gray-500 font-bold mb-1 md:mb-0 pr-4">
          Observatør
        </p>
        <div className="border p-3 rounded shadow">
          <label
            className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4"
            htmlFor="observer_name"
          >
            Fullt navn på observatør
          </label>
          <input
            type="text"
            id="observer_name"
            name="observer_name"
            required={showObserverDetails}
            className="shadow appearance-none border-b w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Navn Navnesen"
            value={form.observer_name}
            onChange={handleChange}
          />
          <label
            className="block text-gray-500 font-bold mt-3 mb-1 md:mb-0 pr-4"
            htmlFor="observer_id"
          >
            Skiltnummer til observatør
          </label>
          <input
            id="observer_id"
            name="observer_id"
            required={showObserverDetails}
            className="shadow appearance-none border-b w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="1234"
            value={form.observer_id}
            onChange={handleChange}
          />
          <label
            className="block mt-3 text-gray-500 font-bold mb-1 md:mb-0 pr-4"
            htmlFor="observer_tel"
          >
            Telefonnummer til observatør
          </label>
          <input
            className="shadow appearance-none w-full border-b py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="observer_tel"
            name="observer_tel"
            type="tel"
            placeholder="123 45 678"
            value={form.observer_tel}
            onChange={handleChange}
            required={showObserverDetails}
          />
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <button
          className={`bg-eo-blue text-background font-bold transition-colors py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
            !isFormValid ? "opacity-50 cursor-not-allowed" : ""
          } ${isFormValid ? "hover:bg-[#85A2B7]" : ""}`}
          type="submit"
          disabled={!isFormValid}
        >
          Send inn
        </button>
      </div>
    </form>
  );
}
