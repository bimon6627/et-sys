"use client";

import { createWhitelistUser } from "@/app/actions/user-actions";
import { useState } from "react";
import { BiSave, BiErrorCircle } from "react-icons/bi";

type DropdownItem = { id: number; name: string };

interface UserFormProps {
  roles: DropdownItem[];
  regions: DropdownItem[];
}

export default function UserForm({ roles, regions }: UserFormProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  // Use useFormStatus if you want loading state (optional)

  const handleSubmit = async (formData: FormData) => {
    setStatusMessage(null);
    setIsSuccess(null);

    const result = await createWhitelistUser(formData);

    if (result.success) {
      setStatusMessage("Bruker opprettet! (Må logge inn via Google)");
      setIsSuccess(true);
      // Optional: Reset form fields here
    } else {
      setStatusMessage(result.message || "En ukjent feil oppsto.");
      setIsSuccess(false);
    }
  };

  return (
    // Note: The form's action points to the Server Action
    <form action={handleSubmit} className="space-y-4 max-w-md">
      {/* Email Input */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          E-post
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="navn@organisasjon.no"
        />
      </div>

      {/* Role Dropdown */}
      <div>
        <label
          htmlFor="roleId"
          className="block text-sm font-medium text-gray-700"
        >
          Rolle
        </label>
        <select
          id="roleId"
          name="roleId"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
        >
          <option value="">Velg Rolle</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      {/* Region Dropdown */}
      <div>
        <label
          htmlFor="regionId"
          className="block text-sm font-medium text-gray-700"
        >
          Region
        </label>
        <select
          id="regionId"
          name="regionId"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
        >
          <option value="">Velg Region</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <BiSave /> Opprett Bruker
      </button>

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`mt-3 p-3 rounded-md flex items-center gap-2 ${
            isSuccess
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {isSuccess ? <BiSave /> : <BiErrorCircle />}
          {statusMessage}
        </div>
      )}
    </form>
  );
}
