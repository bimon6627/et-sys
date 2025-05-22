"use client";
import React, { useState, useEffect } from "react";

async function getStartDateConfig() {
  try {
    const res = await fetch("/api/admin"); // New API endpoint for fetching
    if (!res.ok) {
      console.error("Failed to fetch start date config");
      return null;
    }
    const data = await res.json();
    return data?.value ? { value: data.value } : null;
  } catch (error) {
    console.error("Error fetching start date config:", error);
    return null;
  }
}

async function updateStartDateConfig(newDate: string) {
  try {
    const res = await fetch("/api/admin", {
      // Same endpoint for updating
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value: newDate }),
    });
    if (!res.ok) {
      console.error("Failed to update start date config");
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error updating start date config:", error);
    return false;
  }
}

export default function StartDateConfigForm() {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [newDateInput, setNewDateInput] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const startDateConfig = await getStartDateConfig();
        setStartDate(startDateConfig?.value || null);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load start date config.");
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleDateInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewDateInput(event.target.value);
  };

  const handleUpdateStartDate = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    setUpdateSuccess(null); // Reset success message
    const success = await updateStartDateConfig(newDateInput);
    if (success) {
      setStartDate(newDateInput);
      setUpdateSuccess(true);
      setNewDateInput(""); // Clear the input after successful update
    } else {
      setUpdateSuccess(false);
    }
  };

  if (loading) {
    return <div>Laster inn startdatokonfigurasjon...</div>;
  }

  if (error) {
    return <div>Feil: {error}</div>;
  }

  return (
    <div>
      <h2>Oppdater Startdato</h2>
      {startDate !== null ? (
        <p>Gjeldende startdato: {startDate}</p>
      ) : (
        <p>Startdato er ikke konfigurert.</p>
      )}
      <form
        onSubmit={handleUpdateStartDate}
        className="flex items-center space-x-2 mt-2"
      >
        <input
          type="date"
          className="border rounded p-2"
          value={newDateInput}
          onChange={handleDateInputChange}
        />
        <button
          type="submit"
          className="bg-eo-blue text-white rounded px-4 py-2 hover:bg-eo-blue-dark"
        >
          Lagre
        </button>
      </form>
      {updateSuccess === true && (
        <p className="text-green-500 mt-2">Startdato oppdatert!</p>
      )}
      {updateSuccess === false && (
        <p className="text-red-500 mt-2">Kunne ikke oppdatere startdato.</p>
      )}
    </div>
  );
}
