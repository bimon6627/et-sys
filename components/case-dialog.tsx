"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  BiUser,
  BiMap,
  BiPhone,
  BiCalendar,
  BiSolidCheckboxChecked,
  BiEnvelope,
  BiIdCard,
  BiTime,
  BiEdit,
  BiEditAlt,
} from "react-icons/bi";
import {
  reviewCase,
  deleteCase,
  updateCaseFormData,
} from "@/app/actions/case-actions";
import Link from "next/link";
import GetCaseStatus from "./ts/get-case-status";
import { CaseWithFormReply } from "@/types/case";

interface CaseDialogProps {
  open: boolean;
  data: any;
  onCloseAction: () => void;
}

// Helper: Format for Display (View Mode)
const formatDisplayDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("no-NO", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper: Format for Input (Edit Mode -> YYYY-MM-DDTHH:mm)
const toDatetimeLocal = (dateStr: string | Date) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  // Adjust for timezone offset to ensure the input shows local time
  const offset = date.getTimezoneOffset() * 60000;
  const localISOTime = new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16);
  return localISOTime;
};

const getStatus = (data: CaseWithFormReply) => {
  const status = GetCaseStatus(data);
  const hms = data.hmsFlag ? "HMS " : "";
  let className = "";
  let result = "";
  switch (status) {
    case "ACTIVE":
      result = "Aktiv " + hms + "permisjon";
      className = "bg-green-200 text-green-800";
      break;

    case "SCHEDULED":
      result = "Godkjent " + hms + "permisjon";
      className = "bg-green-50 text-green-600";
      break;

    case "EXPIRED":
      result = "Utgått  " + hms + "permisjon";
      className = "bg-gray-400 text-gray-800";
      break;

    case "PENDING":
      result = data.hmsFlag
        ? "Venter på behandling, HMS"
        : "Venter på behandling";
      className = "bg-yellow-100 text-yellow-800";
      break;

    case "REJECTED":
      result = "Avvist  " + hms + "permisjon";
      className = "bg-red-200 text-red-800";
      break;

    case "SWAP":
      result = "Bytt skiltnummer";
      className = "bg-blue-200 text-blue-800";
      break;

    case "ERROR":
      result = "En feil har oppstått...";
      className = "bg-orange-200 text-orange-700";
      break;
  }
  return { status: result, className: className };
};

export default function CaseDialog({
  open,
  data,
  onCloseAction,
}: CaseDialogProps) {
  const { data: session } = useSession();
  const permissions = session?.user?.permissions || [];

  const canDelete = permissions.includes("case:delete");
  const canWrite = permissions.includes("case:write");
  const canWriteHSE = permissions.includes("hse:write");
  const canDeleteHSE = permissions.includes("hse:delete");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  // --- REVIEW STATE ---
  const [reviewStatus, setReviewStatus] = useState<string>("PENDING");
  const [rejectionReason, setRejectionReason] = useState("");

  // --- EDIT FORM STATE ---
  const [form, setForm] = useState<any>({});

  // Reset state when data changes
  useEffect(() => {
    if (data) {
      setReviewStatus(
        data.status === null ? "PENDING" : data.status ? "APPROVED" : "REJECTED"
      );
      setRejectionReason(data.reason_rejected || "");

      // Initialize form with formatted dates for inputs
      setForm({
        ...data.formReply,
        from: toDatetimeLocal(data.formReply?.from),
        to: toDatetimeLocal(data.formReply?.to),
      });
    }
    setIsEditing(false);
    setIsReviewing(false);
  }, [data, open]);

  // --- HANDLERS ---
  const handleReviewSubmit = async () => {
    if (reviewStatus === "REJECTED" && !rejectionReason) {
      alert("Du må oppgi en årsak for avvisning.");
      return;
    }
    setIsSubmitting(true);
    try {
      const statusBoolean =
        reviewStatus === "APPROVED"
          ? true
          : reviewStatus === "REJECTED"
          ? false
          : null;
      const res = await reviewCase(data.id, statusBoolean, rejectionReason);
      if (res.success) onCloseAction();
      else alert(res.message);
    } catch (e) {
      alert("Feil ved lagring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Convert input strings back to ISO Dates for the server
      const payload = {
        ...form,
        from: new Date(form.from).toISOString(),
        to: new Date(form.to).toISOString(),
      };
      await updateCaseFormData(data.formReply.id, payload);
      setIsEditing(false);
      alert("Endringer lagret.");
    } catch (e) {
      alert("Kunne ikke lagre endringer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Er du sikker på at du vil slette denne søknaden?")) return;
    try {
      await deleteCase(data.id);
      onCloseAction();
    } catch (e) {
      alert("Feil ved sletting.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setForm((prev: any) => ({ ...prev, [name]: val }));
  };

  // 💡 Updated helper to accept a className prop for width control
  const renderField = (
    label: string,
    name: string,
    icon?: React.ElementType,
    className?: string
  ) => (
    <div className={className}>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {icon &&
          React.createElement(icon, {
            className: "text-gray-400 flex-shrink-0",
          })}
        {isEditing ? (
          <input
            name={name}
            value={form[name] || ""}
            onChange={handleInputChange}
            className="border rounded p-1 w-full text-sm"
          />
        ) : (
          <span className="font-medium block truncate" title={form[name]}>
            {form[name] || "-"}
          </span>
        )}
      </div>
    </div>
  );
  const statusResult = getStatus(data);
  return (
    <Dialog open={open} onClose={onCloseAction} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-5xl bg-white rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
          {/* HEADER */}
          <div className="border-b pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Søknad #{data.id}
                </DialogTitle>
                {!isReviewing && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${statusResult.className}`}
                  >
                    {statusResult.status}
                  </span>
                )}
              </div>
              {data.hmsFlag && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-2">
                  HMS-Permisjon
                </span>
              )}
            </div>
            {data.participant ? (
              <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg flex items-center gap-3">
                <BiUser className="text-blue-600 size-5" />
                <div>
                  <Link
                    href={`/dashboard/deltakere/${data.participant.id}`}
                    className="text-sm font-bold text-blue-900 hover:underline"
                  >
                    {data.participant.name}
                  </Link>
                  <p className="text-xs text-blue-700">
                    Skiltnr: {data.participant.participant_id}
                  </p>
                </div>
              </div>
            ) : (
              <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded">
                Ikke knyttet til deltaker
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* LEFT: Application Details */}
            <div className="space-y-6 pr-4 border-r">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-gray-800 text-lg">
                  Søknadsinformasjon
                </h3>
                {canWrite && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    <span className="flex flex-row items-center">
                      <BiEditAlt />
                      Rediger info
                    </span>
                  </button>
                )}
              </div>

              {/* 💡 UPDATED GRID LAYOUT: 3 Columns */}
              <div className="grid grid-cols-3 gap-4">
                {/* Name and Email take 2/3 space */}
                {renderField("Navn", "name", BiUser, "col-span-2")}
                {/* ID takes 1/3 space */}
                {renderField(
                  "Skiltnr",
                  "participant_id",
                  BiIdCard,
                  "col-span-1"
                )}

                {/* Email takes 2/3 space */}
                {renderField("E-post", "email", BiEnvelope, "col-span-2")}
                {/* Phone takes 1/3 space */}
                {renderField("Telefon", "tel", BiPhone, "col-span-1")}
              </div>

              {/* Location & Time */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <div className="flex items-center gap-2">
                  <BiMap className="text-gray-500" />
                  {isEditing ? (
                    <input
                      name="county"
                      value={form.county}
                      onChange={handleInputChange}
                      className="border rounded p-1 text-sm w-full"
                    />
                  ) : (
                    <span className="font-medium">{form.county}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <BiCalendar className="text-gray-500" />
                    <span className="text-xs font-bold uppercase text-gray-500 w-8">
                      Fra:
                    </span>
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        name="from"
                        value={form.from}
                        onChange={handleInputChange}
                        className="border rounded p-1 text-sm w-full"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {formatDisplayDate(data.formReply?.from)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <BiTime className="text-gray-500" />
                    <span className="text-xs font-bold uppercase text-gray-500 w-8">
                      Til:
                    </span>
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        name="to"
                        value={form.to}
                        onChange={handleInputChange}
                        className="border rounded p-1 text-sm w-full"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {formatDisplayDate(data.formReply?.to)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Årsak
                </label>
                {isEditing ? (
                  <textarea
                    name="reason"
                    value={form.reason}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2 text-sm h-20"
                  />
                ) : (
                  <div className="bg-blue-50 p-3 rounded border border-blue-100 text-blue-900 italic text-sm">
                    "{form.reason}"
                  </div>
                )}
              </div>

              {/* Observer Details */}
              {form.has_observer && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2 text-sm">
                    <BiSolidCheckboxChecked className="text-blue-600 size-5" />{" "}
                    Har Observatør
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {renderField("Navn", "observer_name")}
                    {renderField("Skilt", "observer_id")}
                    {renderField("Tlf", "observer_tel")}
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleEditSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 text-white py-2 rounded font-bold text-sm hover:bg-blue-700"
                  >
                    Lagre Endringer
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-200 rounded text-sm hover:bg-gray-300"
                  >
                    Avbryt
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT: Review Controls */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-fit">
              <h3 className="font-bold text-gray-800 text-lg border-b pb-2 mb-4">
                Behandling
              </h3>

              {(canWrite && !data.hmsFlag) ||
              (canWrite && data.hmsFlag && canWriteHSE) ? (
                <>
                  {!isReviewing ? (
                    <div className="text-center space-y-4">
                      <p className="text-sm text-gray-600">
                        Søknaden er{" "}
                        {data.status === true
                          ? "allerede godkjent"
                          : data.status === false
                          ? "avvist"
                          : "ikke behandlet"}
                        .
                      </p>
                      <button
                        onClick={() => setIsReviewing(true)}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        <BiEdit className="size-5" /> Behandle Søknad
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                          Ny Status
                        </label>
                        <select
                          value={reviewStatus}
                          onChange={(e) => setReviewStatus(e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                        >
                          <option value="PENDING">Venter på behandling</option>
                          <option value="APPROVED">Godkjent</option>
                          <option value="REJECTED">Avvist</option>
                        </select>
                      </div>

                      {reviewStatus === "REJECTED" && (
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                            Årsak til avvisning
                          </label>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full p-3 border border-red-300 rounded-lg h-24 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                            placeholder="Skriv årsak..."
                          />
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleReviewSubmit}
                          disabled={isSubmitting}
                          className={`flex-1 py-2 rounded-lg font-bold text-white transition-all shadow-sm ${
                            reviewStatus === "REJECTED"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {isSubmitting ? "Lagrer..." : "Lagre og send"}
                        </button>
                        <button
                          onClick={() => setIsReviewing(false)}
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                        >
                          Avbryt
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-white rounded border border-dashed">
                  Du har ikke tilgang til å behandle søknader.
                </div>
              )}

              {data.reviewedBy && !isReviewing && (
                <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
                  <p>
                    Sist behandlet av{" "}
                    <span className="font-medium text-gray-600">
                      {data.reviewedBy}
                    </span>
                  </p>
                  <p>{new Date(data.reviewedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-8 pt-4 border-t flex justify-between items-center">
            <button
              onClick={onCloseAction}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Lukk
            </button>
            {canDelete && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium"
              >
                Slett Søknad
              </button>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
