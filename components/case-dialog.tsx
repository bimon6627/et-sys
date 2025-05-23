import { CaseWithFormReply } from "@/types/case";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import getStatusSymbol from "./status-symbol";
import React, { useEffect, useState } from "react";
import GetCaseStatus from "./ts/get-case-status";
import { useSession } from "next-auth/react";

interface User {
  name?: string | undefined;
  image?: string | undefined;
  given_name?: string | undefined;
  family_name?: string | undefined;
  email?: string | undefined;
  role?: string | undefined;
}

interface CaseDialogProps {
  open: boolean;
  data: CaseWithFormReply;
  user: User;
  onClose: () => void;
}

function getNotReturning(inDate: Date | null | undefined) {
  if (!inDate) return false; // If there's no date, they are returning by default
  const dayOfWeek = inDate.getDay();
  // Returns true if the day is Sunday (0) or Saturday (6)
  return dayOfWeek === 0 || dayOfWeek === 6;
}

function getTimeString(inDate: Date | null | undefined) {
  if (!inDate) return "";
  const hours = inDate.getHours();
  const mins = inDate.getMinutes();
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(mins).padStart(2, "0");
  return `${formattedHours}:${formattedMinutes}`;
}

function getDayNumberAsString(inDate: Date | null | undefined) {
  if (!inDate) return "0";
  return (inDate.getDay() - 1).toString();
}

export default function CaseDialog({
  open,
  data,
  user,
  onClose,
}: CaseDialogProps) {
  // It's safer to directly use data.formReply in the useEffect and useState,
  // making sure to handle the `null` possibility.
  // The `caseForm` state isn't strictly necessary if `form` is derived directly.
  // const [caseForm, setCaseForm] = useState(data.formReply);

  const [isFormValid, setIsFormValid] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data: session } = useSession();

  // Initialize form state using a function to ensure it's fresh on first render
  // and then handled by the useEffect for subsequent data changes.

  const [caseData, setCaseData] = useState(() => ({
    id: data.id || 0,
    id_swapped: data.id_swapped || false,
    status: data.status?.toString() || "null",
    reason_rejected: data.reason_rejected || "",
    comment: data.comment,
    reviewedById: data.reviewedById,
    reviewedBy: data.reviewedBy,
    reviewedAt: data.reviewedAt,
  }));

  const [form, setForm] = useState(() => ({
    id: data.formReplyId || 0,
    type: data.formReply?.type || "",
    participant_id: data.formReply?.participant_id || "",
    name: data.formReply?.name || "",
    email: data.formReply?.email || "",
    county: data.formReply?.county || "",
    from_day: getDayNumberAsString(data.formReply?.from),
    from_time: getTimeString(data.formReply?.from),
    to_day: getDayNumberAsString(data.formReply?.to),
    to_time: getTimeString(data.formReply?.to),
    tel: data.formReply?.tel || "",
    has_observer: data.formReply?.has_observer || false,
    not_returning: getNotReturning(data.formReply?.to) || false,
    reason: data.formReply?.reason || "",
    observer_name: data.formReply?.observer_name || "",
    observer_id: data.formReply?.observer_id || "",
    observer_tel: data.formReply?.observer_tel || "",
  }));

  // This useEffect will update the 'form' state whenever the 'data' prop changes.
  useEffect(() => {
    if (data?.formReply) {
      setForm({
        id: data.formReplyId || 0,
        type: data.formReply.type || "",
        participant_id: data.formReply.participant_id || "",
        name: data.formReply.name || "",
        email: data.formReply.email || "",
        county: data.formReply.county || "",
        from_day: getDayNumberAsString(data.formReply?.from),
        from_time: getTimeString(data.formReply.from),
        to_day: getDayNumberAsString(data.formReply?.to),
        to_time: getTimeString(data.formReply.to),
        tel: data.formReply.tel || "",
        has_observer: data.formReply.has_observer || false,
        not_returning: getNotReturning(data.formReply?.to) || false,
        reason: data.formReply.reason || "",
        observer_name: data.formReply.observer_name || "",
        observer_id: data.formReply.observer_id || "",
        observer_tel: data.formReply.observer_tel || "",
      });
    } else {
      // Handle the case where formReply is null or undefined
      // You might want to reset the form to empty or a default state
      setForm({
        id: 0,
        type: "",
        participant_id: "",
        name: "",
        email: "",
        county: "",
        from_day: "0",
        from_time: "",
        to_day: "0",
        to_time: "",
        tel: "",
        has_observer: false,
        not_returning: false,
        reason: "",
        observer_name: "",
        observer_id: "",
        observer_tel: "",
      });
    }
  }, [data]); // Depend on 'data' prop, so this runs whenever 'data' changes

  useEffect(() => {
    if (data) {
      setCaseData({
        id: data.id || 0,
        id_swapped: data.id_swapped || false,
        status: data.status?.toString() || "null",
        reason_rejected: data.reason_rejected || "",
        comment: data.comment,
        reviewedById: data.reviewedById,
        reviewedBy: data.reviewedBy,
        reviewedAt: data.reviewedAt,
      });
    } else {
      setCaseData({
        id: 0,
        id_swapped: false,
        status: "null",
        reason_rejected: "",
        comment: null,
        reviewedById: null,
        reviewedBy: null,
        reviewedAt: null,
      });
    }
  }, [data]); // Depend on 'data' prop, so this runs whenever 'data' changes

  useEffect(() => {
    validateForm();
  }, [form]); // Depend on 'form' state, so this runs when form data changes

  const validateForm = () => {
    // Ensure form exists before validating, though useEffect above should prevent this
    if (!form) {
      setIsFormValid(false);
      return false;
    }

    // Defensive checks for properties that might be null/undefined
    const email = form.email || "";
    const county = form.county || "";
    const name = form.name || "";
    const tel = form.tel || "";
    const id = form.participant_id || "";
    const observer_id = form.observer_id || "";
    const observer_tel = form.observer_tel || "";
    const observer_name = form.observer_name || "";
    const reason = form.reason || "";

    const has_observer = form.has_observer && form.type === "DELEGATE";
    const idValid = /^\d{1,4}$/.test(id);
    const typeValid = form.type === "DELEGATE" || form.type === "OBSERVER";
    const emailValid = email.includes("@");
    const nameValid = name !== "";
    const telValid = /^\d{8}$/.test(tel);
    const countyValid = county.length > 0;
    const from_dayValid = form.from_day !== "";
    const to_dayValid = form.to_day !== "" || form.not_returning;
    const reasonValid = reason !== "";
    const observer_nameValid = observer_name !== "" || !has_observer;
    const observer_idValid = /^\d{1,4}$/.test(observer_id) || !has_observer;
    const observer_telValid = /^\d{8}$/.test(observer_tel) || !has_observer;

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

  const handleReview = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const newValue: string | boolean = value;

    setCaseData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    let newValue: string | boolean = value;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      newValue = checked;
    }

    if (name === "tel" || name === "observer_tel") {
      newValue = value.replace(/\D/g, "").slice(0, 8);
    }

    if (name === "id" || name === "observer_id") {
      newValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  function updateData() {
    data.status =
      caseData.status === "null" ? null : caseData.status === "true";
    data.reason_rejected = caseData.reason_rejected;
    data.reviewedAt = new Date();
    data.reviewedBy = user.email;
    //Missing certain fields
  }

  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (caseData.status == "false" && caseData.reason_rejected == "") {
      alert("Du må oppgi en årsak for avvisning.");
      return;
    }
    setIsSubmittingReview(true);
    caseData.reviewedAt = new Date();
    caseData.reviewedBy = session?.user.email;

    const res = await fetch("/api/cases", {
      method: "PATCH",
      body: JSON.stringify(caseData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    setIsSubmittingReview(false);

    if (res.ok) {
      updateData();
    } else {
      alert("Error submitting changes to case.");
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Subitting!!!");
    e.preventDefault();
    setIsSubmitting(true);

    const res = await fetch("/api/form-reply", {
      method: "PATCH",
      body: JSON.stringify(form),
      headers: {
        "Content-Type": "application/json",
      },
    });

    setIsSubmitting(false);

    if (res.ok) {
      setIsEditing(false);
    } else {
      alert("Error submitting form.");
    }
  };

  const handleDelete = async () => {
    if (confirm("Er du sikker på at du vil slette denne permisjonssøknaden?")) {
      const res = await fetch("/api/cases", {
        method: "DELETE",
        body: JSON.stringify(caseData.id),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        onClose();
      } else {
        alert("En feil oppsto under slettingen.");
      }
    }
  };

  const handleCancel = () => {
    // Reset form to initial data when cancelling edit
    if (data?.formReply) {
      setForm({
        id: data.formReplyId || 0,
        type: data.formReply.type || "",
        participant_id: data.formReply?.participant_id || "",
        name: data.formReply.name || "",
        email: data.formReply.email || "",
        county: data.formReply.county || "",
        from_day: data.formReply?.from?.getDay().toString() || "0",
        from_time: getTimeString(data.formReply.from),
        to_day: data.formReply?.to?.getDay().toString() || "0",
        to_time: getTimeString(data.formReply.to),
        tel: data.formReply.tel || "",
        has_observer: data.formReply.has_observer || false,
        not_returning: getNotReturning(data.formReply?.to) || false,
        reason: data.formReply.reason || "",
        observer_name: data.formReply.observer_name || "",
        observer_id: data.formReply.observer_id || "",
        observer_tel: data.formReply.observer_tel || "",
      });
    }
    setIsEditing(false); // Disable editing mode
  };

  const enableEdit = () => {
    setIsEditing(true);
  };

  function caseReview() {
    const reviewType = GetCaseStatus(data);
    let text = "";
    switch (reviewType) {
      case "ACTIVE":
        text = "Aktiv";
        break;
      case "PENDING":
        text = "Venter på behandling";
        break;
      case "REJECTED":
        text = "Avvist";
        break;
      case "SCHEDULED":
        text = "Godkjent";
        break;
      case "EXPIRED":
        text = "Utgått";
        break;
      case "ERROR":
        text = "Error";
        break;
    }
    return (
      <div className="flex flex-row gap-2 w-fit py-1 px-2 mx-auto border rounded-md cursor-default">
        {getStatusSymbol(data)}
        <p>{text}</p>
      </div>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-fit data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div>
                <div className="mt-3 w-full text-center sm:mt-0">
                  <DialogTitle
                    as="h3"
                    className="text-base text-center w-full font-semibold text-gray-900"
                  >
                    Permisjonssøknad for{" "}
                    {form.type == "DELEGATE" ? "delegat" : "observatør"}{" "}
                    {form.participant_id}
                  </DialogTitle>
                  <div className="mt-2">
                    <form
                      className="w-full flex flex-col md:flex-row"
                      onSubmit={handleSubmit}
                      id="caseForm"
                    >
                      <div className="flex flex-col-reverse md:flex-row">
                        <div className="border-t-2 flex flex-col pb-4 md:border-t-transparent md:pb-0 md:border-r md:pr-4 md:h-full">
                          <div className="w-full md:w-full mb-6 mt-3 md:mb-0">
                            <label
                              className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4"
                              htmlFor="grid-state"
                            >
                              Permisjon fra
                            </label>
                            <div className="md:flex md:items-center">
                              <div className="relative w-1/2 mr-2">
                                <select
                                  name="from_day"
                                  id="from_day"
                                  value={form.from_day}
                                  onChange={handleChange}
                                  className="block disabled:cursor-not-allowed cursor-pointer appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline"
                                  disabled={!isEditing}
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
                                  className="disabled:cursor-not-allowed cursor-pointer appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                  value={form.from_time}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          <div
                            aria-hidden={!form.not_returning}
                            className={`transition-all duration-300 mt-3 ease-in-out transform overflow-hidden ${
                              !form.not_returning ? "" : "hidden"
                            }`}
                          >
                            <label
                              className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4"
                              htmlFor="grid-state"
                            >
                              Permisjon til
                            </label>
                            <div className="md:flex md:items-center">
                              <div className="relative w-1/2 mr-2">
                                <select
                                  name="to_day"
                                  id="to_day"
                                  value={form.to_day}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  className="block disabled:cursor-not-allowed cursor-pointer appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline"
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
                                  className="disabled:cursor-not-allowed cursor-pointer appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                  value={form.to_time}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  required={!form.not_returning}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="hidden md:block mt-auto">
                            <h2 className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4">
                              Status:
                            </h2>
                            {caseReview()}
                            <div className="w-full md:w-full mb-6 mt-3 md:mb-0">
                              <div className="relative">
                                <select
                                  name="status"
                                  id="status"
                                  value={caseData.status}
                                  onChange={handleReview}
                                  className="block cursor-pointer appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline"
                                >
                                  <option value="null" disabled hidden>
                                    Venter på behandling
                                  </option>
                                  <option value="true">Godkjent</option>
                                  <option value="false">Avvist</option>
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
                            <div hidden={caseData.status !== "false"}>
                              <label
                                className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4 mt-3"
                                htmlFor="reason"
                              >
                                Årsak avvist
                              </label>
                              <textarea
                                name="reason_rejected"
                                id="reason_rejected"
                                placeholder="Skriv årsaken til permisjonen her..."
                                value={caseData.reason_rejected}
                                onChange={handleReview}
                                rows={5}
                                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleReviewSubmit}
                              disabled={
                                (caseData.reason_rejected === "" &&
                                  caseData.status === "false") ||
                                isSubmittingReview
                              }
                              className={`disabled:cursor-not-allowed disabled:bg-green-400 className="inline-flex w-full justify-center rounded-md mt-2 bg-green-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-400 ${
                                (data.status?.toString() || "null") !==
                                  caseData.status ||
                                data.reason_rejected !==
                                  caseData.reason_rejected
                                  ? "block"
                                  : "hidden"
                              }`}
                            >
                              Bekreft
                            </button>
                          </div>
                        </div>
                        <div
                          className={`md:pl-4 ${
                            form.has_observer
                              ? "border-b-2 pb-4 md:border-b-transparent md:pb-0 md:border-r md:pr-4"
                              : ""
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
                            className="disabled:cursor-not-allowed disabled:opacity-80 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Navn Navnesen"
                            value={form.name} // Use the 'form' state
                            onChange={handleChange}
                            disabled={!isEditing}
                          />
                          {/* Add more form fields here, using `form.fieldName` for value and `handleChange` for onChange */}

                          {/* Example for Email */}
                          <div className="flex flex-row gap-8 w-full">
                            <div className="w-1/2">
                              <label
                                className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4 mt-4"
                                htmlFor="email"
                              >
                                E-post
                              </label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                className="disabled:cursor-not-allowed disabled:opacity-80 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="example@email.com"
                                value={form.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                              />
                            </div>
                            <div className="w-1/2">
                              <label
                                className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4 mt-4"
                                htmlFor="tlf"
                              >
                                Telefon
                              </label>
                              <input
                                type="tlf"
                                id="tlf"
                                name="tlf"
                                required
                                className="disabled:cursor-not-allowed disabled:opacity-80 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="12345678"
                                value={form.tel}
                                onChange={handleChange}
                                disabled={!isEditing}
                              />
                            </div>
                          </div>

                          {/* Example for Type */}
                          <label
                            className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4 mt-4"
                            htmlFor="type"
                          >
                            Deltakertype
                          </label>
                          <select
                            id="type"
                            name="type"
                            required
                            className="block disabled:cursor-not-allowed cursor-pointer appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline"
                            value={form.type}
                            onChange={handleChange}
                            disabled={!isEditing}
                          >
                            <option value="" disabled hidden>
                              Velg type
                            </option>
                            <option value="DELEGATE">Delegat</option>
                            <option value="OBSERVER">Observatør</option>
                          </select>

                          {/* Example for Has Observer checkbox */}
                          <div className="flex flex-row gap-8">
                            <div className="flex items-center mt-4">
                              <input
                                type="checkbox"
                                id="has_observer"
                                name="has_observer"
                                className="disabled:cursor-not-allowed form-checkbox h-5 w-5 text-blue-600"
                                checked={form.has_observer}
                                onChange={handleChange}
                                disabled={!isEditing}
                              />
                              <label
                                htmlFor="has_observer"
                                className="ml-2 text-gray-700"
                              >
                                Har observatør
                              </label>
                            </div>

                            {/* Example for Not Returning checkbox */}
                            <div className="flex items-center mt-4">
                              <input
                                type="checkbox"
                                id="not_returning"
                                name="not_returning"
                                className="disabled:cursor-not-allowed form-checkbox h-5 w-5 text-blue-600"
                                checked={form.not_returning}
                                onChange={handleChange}
                                disabled={!isEditing}
                              />
                              <label
                                htmlFor="not_returning"
                                className="ml-2 text-gray-700"
                              >
                                Kommer ikke tilbake
                              </label>
                            </div>
                          </div>
                          <div className="flex flex-row gap-8">
                            <div>
                              <label
                                className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4"
                                htmlFor="county"
                              >
                                Fylke
                              </label>
                              <input
                                type="text"
                                id="county"
                                name="county"
                                required
                                className="disabled:cursor-not-allowed disabled:opacity-80 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Vestland"
                                value={form.county} // Use the 'form' state
                                onChange={handleChange}
                                disabled={!isEditing}
                              />
                            </div>
                            <div>
                              <label
                                className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4"
                                htmlFor="county"
                              >
                                Skiltnr.
                              </label>
                              <input
                                type="text"
                                id="participant_id"
                                name="participant_id"
                                required
                                className="disabled:cursor-not-allowed disabled:opacity-80 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="1234"
                                value={form.participant_id} // Use the 'form' state
                                onChange={handleChange}
                                disabled={!isEditing}
                              />
                            </div>
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
                            className="disabled:cursor-not-allowed appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none"
                            disabled={!isEditing}
                          />
                          {/* More fields (tel, county, dates, reason, observer details) */}
                          {/* You'll need to add inputs for all the fields in your `form` state */}
                        </div>
                      </div>
                      <div
                        className={`${
                          form.has_observer ? "pt-4 md:pt-0 md:pl-4" : "hidden"
                        }`}
                      >
                        <h2 className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4">
                          Observatør:
                        </h2>
                        <label
                          className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4"
                          htmlFor="observer_name"
                        >
                          Fullt navn
                        </label>
                        <input
                          type="text"
                          id="observer_name"
                          name="observer_name"
                          className="disabled:cursor-not-allowed disabled:opacity-80 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          placeholder="Navn Navnesen"
                          value={form.observer_name}
                          onChange={handleChange}
                          required={form.has_observer}
                          disabled={!(isEditing && form.has_observer)}
                        />
                        <label
                          className="block text-gray-500 font-bold mt-3 mb-1 md:mb-0 pr-4"
                          htmlFor="observer_id"
                        >
                          Skiltnummer
                        </label>
                        <input
                          id="observer_id"
                          name="observer_id"
                          className="disabled:cursor-not-allowed disabled:opacity-80 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          placeholder="1234"
                          value={form.observer_id}
                          onChange={handleChange}
                          required={form.has_observer}
                          disabled={!(isEditing && form.has_observer)}
                        />
                        <label
                          className="block mt-3 text-gray-500 font-bold mb-1 md:mb-0 pr-4"
                          htmlFor="observer_tel"
                        >
                          Telefonnummer
                        </label>
                        <input
                          className="disabled:cursor-not-allowed disabled:opacity-80 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          id="observer_tel"
                          name="observer_tel"
                          type="tel"
                          placeholder="123 45 678"
                          value={form.observer_tel}
                          onChange={handleChange}
                          required={form.has_observer}
                          disabled={!(isEditing && form.has_observer)}
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type={!isEditing ? "button" : "submit"}
                disabled={isSubmitting || (isEditing && !isFormValid)}
                form="caseForm"
                onClick={(e) => {
                  if (!isEditing) {
                    // If not in editing mode, clicking should enable edit
                    e.preventDefault(); // Crucial: Prevent default form submission if it somehow triggers
                    enableEdit();
                  }
                  // If in editing mode, let the type="submit" handle it
                  // No need for a custom onClick here for "Lagre" state as type="submit" will trigger form's onSubmit
                }}
                className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs sm:ml-3 sm:w-auto ${
                  !isEditing
                    ? "bg-blue-500 hover:bg-blue-400"
                    : "bg-green-500 hover:bg-green-400"
                } ${isSubmitting ? "cursor-progress opacity-50" : ""}`}
              >
                {!isEditing ? "Rediger" : !isSubmitting ? "Lagre" : "Lagrer..."}
              </button>
              <button
                type="button"
                data-autofocus
                onClick={isEditing ? handleCancel : onClose} // Use handleCancel to revert changes and close
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                {isEditing ? "Avbryt" : "Lukk"}
              </button>
              <button
                type="button"
                data-autofocus
                onClick={handleDelete} // Use handleCancel to revert changes and close
                className="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs mr-auto sm:w-auto bg-red-500 hover:bg-red-400"
              >
                Slett
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
