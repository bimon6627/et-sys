"use client";

import React, { useState, useEffect } from "react";
import {
  getEventConfig,
  updateEventConfig,
} from "@/app/actions/config-actions";
import { BiCalendar, BiSave, BiLoaderAlt, BiMailSend } from "react-icons/bi";

export default function EventConfigForm() {
  const [config, setConfig] = useState({
    startDate: "",
    endDate: "",
    canSendEmails: "",
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getEventConfig();
        setConfig(data);
      } catch (err) {
        setStatus({ type: "error", msg: "Kunne ikke laste konfigurasjon." });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setIsSaving(true);

    const res = await updateEventConfig(config.startDate, config.endDate);

    if (res.success) {
      setStatus({ type: "success", msg: "Konfigurasjon lagret!" });
    } else {
      setStatus({ type: "error", msg: res.message || "Feil ved lagring." });
    }
    setIsSaving(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <BiLoaderAlt className="animate-spin" /> Laster konfigurasjon...
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <section>
          <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2 border-b-2 border-gray-800">
            <BiCalendar /> Tidspunkt for arrangement
          </h2>
          {/* Start Date */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Startdato
            </label>
            <input
              type="date"
              name="startDate"
              className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              value={config.startDate}
              onChange={handleChange}
              required
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Sluttdato
            </label>
            <input
              type="date"
              name="endDate"
              className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              value={config.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2 border-b-2 border-gray-800">
            <BiMailSend /> E-postkonfigurasjon
          </h2>
          <div>
            <label>Systemet kan sende e-poster: </label>
            <input
              type="checkbox"
              name="canSendEmails"
              value={config.canSendEmails}
            />
          </div>
        </section>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-6 py-2.5 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? <BiLoaderAlt className="animate-spin" /> : <BiSave />}
          {isSaving ? "Lagrer..." : "Lagre Endringer"}
        </button>
      </form>

      {/* Feedback Message */}
      {status && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm font-medium ${
            status.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {status.msg}
        </div>
      )}
    </div>
  );
}
