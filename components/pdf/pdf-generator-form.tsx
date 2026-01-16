"use client";

import { useState } from "react";
import { BiFile, BiLoaderAlt, BiDownload, BiError, BiHeading } from "react-icons/bi";

export default function PdfGeneratorForm() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(""); // 💡 Ny state for tittel
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("excelFile", file);
    // 💡 Send med tittelen hvis den er satt
    if (title) {
        formData.append("title", title);
    }

    try {
      const response = await fetch("/api/pdf/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || data.error || "Ukjent feil");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Bruk tittelen i filnavnet hvis mulig
      const safeTitle = title ? title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'vedtaksbok';
      a.download = `${safeTitle}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Noe gikk galt under generering.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-red-50 rounded-full text-red-600">
            <BiFile className="size-8" />
        </div>
        <div>
            <h2 className="text-xl font-bold text-gray-800">Generer Forslagsblekke</h2>
            <p className="text-sm text-gray-500">Last opp Excel-filen med vedtak for å generere PDF.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 💡 Title Input */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
                Dokumenttittel (Valgfritt)
            </label>
            <div className="relative">
                <BiHeading className="absolute top-3 left-3 text-gray-400 size-5" />
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="F.eks. Redaksjonskomitéens innstilling..."
                    className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                />
            </div>
            <p className="text-xs text-gray-500 mt-1">Vises øverst på første side i fet skrift.</p>
        </div>

        {/* File Input Zone */}
        <div className="relative">
          <input
            type="file"
            id="excel-upload"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="hidden"
            disabled={isLoading}
          />
          <label
            htmlFor="excel-upload"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              file
                ? "border-green-400 bg-green-50 text-green-700"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-500"
            }`}
          >
            {file ? (
              <>
                <BiFile className="size-8 mb-2" />
                <p className="font-medium">{file.name}</p>
                <p className="text-xs">{(file.size / 1024).toFixed(1)} KB</p>
              </>
            ) : (
              <>
                <BiFile className="size-8 mb-2" />
                <p className="font-medium">Klikk for å velge fil</p>
                <p className="text-xs">Kun .xlsx filer</p>
              </>
            )}
          </label>
        </div>

        {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3 text-sm">
                <BiError className="size-5 shrink-0" />
                <span className="break-all">{error}</span>
            </div>
        )}

        <div className="flex justify-end">
            <button
            type="submit"
            disabled={!file || isLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all ${
                !file || isLoading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 shadow-md"
            }`}
            >
            {isLoading ? (
                <>
                    <BiLoaderAlt className="animate-spin size-5" />
                    Genererer PDF...
                </>
            ) : (
                <>
                    <BiDownload className="size-5" />
                    Last ned PDF
                </>
            )}
            </button>
        </div>
      </form>
    </div>
  );
}