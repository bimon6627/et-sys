"use client";

import { useState } from "react";
import {
  importParticipants,
  syncFromLegacySystem,
} from "@/app/actions/import-actions"; // 💡 Import sync action
import {
  BiUpload,
  BiLoaderAlt,
  BiCloudDownload,
  BiCheckCircle,
  BiErrorCircle,
} from "react-icons/bi";

export default function ImportFormClient() {
  const [status, setStatus] = useState<{
    message: string;
    success: boolean;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileKey, setFileKey] = useState(Date.now());

  // --- HANDLER: AUTO SYNC ---
  const handleAutoSync = async () => {
    if (
      !confirm(
        "Er du sikker på at du vil starte automatisk import fra det gamle systemet?",
      )
    ) {
      return;
    }

    setStatus(null);
    setIsSubmitting(true);

    try {
      const result = await syncFromLegacySystem();
      setStatus(result);
    } catch (error: any) {
      setStatus({
        success: false,
        message: "En ukjent feil oppsto under synkronisering.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLER: MANUAL UPLOAD ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await importParticipants(formData);
      setStatus(result);

      if (result.success) {
        setFileKey(Date.now());
      }
    } catch (error: any) {
      setStatus({
        success: false,
        message: error.message || "En ukjent feil oppsto.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* 1. STATUS MESSAGE AREA */}
      {status && (
        <div
          className={`p-4 rounded-lg border font-medium flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${
            status.success
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {status.success ? (
            <BiCheckCircle className="size-6 shrink-0" />
          ) : (
            <BiErrorCircle className="size-6 shrink-0" />
          )}
          <div>
            <p className="font-bold">{status.success ? "Suksess" : "Feil"}</p>
            <p className="text-sm opacity-90">{status.message}</p>
          </div>
        </div>
      )}

      {/* 2. AUTO SYNC CARD (Primary Option) */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-100 rounded-full text-blue-700">
            <BiCloudDownload className="size-6" />
          </div>
          <h2 className="text-xl font-bold text-blue-900">Automatisk Import</h2>
        </div>
        <p className="text-blue-800 text-sm mb-6 max-w-lg">
          Henter data automatisk fra registrer.elevtinget.no og synkroniserer
          med databasen
        </p>
        <button
          type="button"
          onClick={handleAutoSync}
          disabled={isSubmitting}
          className={`flex items-center justify-center w-full sm:w-auto gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-blue-700 transition-all ${
            isSubmitting ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? (
            <BiLoaderAlt className="animate-spin size-5" />
          ) : (
            <BiCloudDownload className="size-5" />
          )}
          {isSubmitting ? "Synkroniserer..." : "Start Synkronisering"}
        </button>
      </div>

      {/* DIVIDER */}
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">
          Eller last opp manuelt
        </span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      {/* 3. MANUAL UPLOAD CARD (Fallback Option) */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-6 bg-white border border-gray-200 rounded-xl shadow-sm"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gray-100 rounded-full text-gray-600">
            <BiUpload className="size-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Last opp Excel-fil
          </h2>
        </div>

        <div>
          <label
            htmlFor="excelFile"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Velg .xlsx fil fra din maskin:
          </label>
          <input
            key={fileKey}
            id="excelFile"
            name="excelFile"
            type="file"
            accept=".xlsx, .xls"
            required
            disabled={isSubmitting}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-gray-100 file:text-gray-700
              hover:file:bg-gray-200
              cursor-pointer border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm hover:bg-gray-800 transition-all ${
              isSubmitting ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <BiLoaderAlt className="animate-spin" />
                Behandler...
              </>
            ) : (
              <>
                <BiUpload />
                Last opp
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
