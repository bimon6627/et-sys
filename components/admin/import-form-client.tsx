// components/admin/import-form-client.tsx
"use client"; // 👈 DIRECTIVE IS HERE

import { useState } from "react"; // 👈 Import useState here
import { importParticipants } from "@/app/actions/import-actions";
import { BiUpload } from "react-icons/bi";

export default function ImportFormClient() {
  const [status, setStatus] = useState<{
    message: string;
    success: boolean;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileKey, setFileKey] = useState(Date.now()); // Key to reset file input

  // NOTE: handleSubmit must be async as it calls a Server Action
  const handleSubmit = async (formData: FormData) => {
    setStatus(null);
    setIsSubmitting(true);

    try {
      const result = await importParticipants(formData);
      setStatus(result);
      // Reset file input by changing key
      setFileKey(Date.now());
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
    <form
      action={handleSubmit}
      className="space-y-6 p-6 bg-white border rounded-lg shadow-lg"
    >
      {/* ... rest of your form JSX (Status, Input, Button) ... */}

      <h2 className="text-xl font-semibold">Last opp Excel-fil</h2>

      {status && (
        <div
          className={`p-3 rounded-md font-medium ${
            status.success
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {status.message}
        </div>
      )}

      <div>
        <label
          htmlFor="excelFile"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Velg Excel (.xlsx) fil:
        </label>
        <input
          key={fileKey}
          id="excelFile"
          name="excelFile"
          type="file"
          accept=".xlsx, .xls"
          required
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50"
      >
        <BiUpload />
        {isSubmitting ? "Behandler fil..." : "Start Import"}
      </button>
    </form>
  );
}
