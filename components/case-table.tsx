"use client";
import { useState, useEffect, useRef } from "react"; // Import useEffect
import { BiCheckbox, BiCheckboxChecked, BiError } from "react-icons/bi";
import { CaseWithFormReply } from "@/types/case";
import CaseDialog from "./case-dialog";
import getStatusSymbol from "./status-symbol";

interface User {
  name?: string | undefined;
  image?: string | undefined;
  given_name?: string | undefined;
  family_name?: string | undefined;
  email?: string | undefined;
  role?: string | undefined;
}

interface CaseTableProps {
  user: User;
  initialCases: CaseWithFormReply[];
}

function getDateString(inDate: Date) {
  const offset = inDate.getDay();
  const days = ["Man", "Tir", "Ons", "Tor", "Fre", "Kommer ikke tilbake"];
  const day = days[offset - 1];
  if (offset > 5 || offset < 1) return "Kommer ikke tilbake";

  const hours = inDate.getHours();
  const mins = inDate.getMinutes();
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(mins).padStart(2, "0");

  return `${day} ${formattedHours}:${formattedMinutes}`;
}

export default function CaseTable({ user, initialCases }: CaseTableProps) {
  // Make this a regular synchronous function
  const [cases, setCases] = useState(initialCases); // Use state for cases
  const [activeButton, setActiveButton] = useState("Alle");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState(initialCases[0]); // State to hold the JSON object

  const titleRef = useRef<HTMLDivElement>(null); // Assuming your buttons are in a div
  const headerRef = useRef<HTMLTableSectionElement>(null);
  const scrollableBodyRef = useRef<HTMLDivElement>(null);

  const openDialog = (caseData: CaseWithFormReply) => {
    setDialogData(caseData);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  useEffect(() => {
    if (user === undefined) {
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const fetchNewCases = async () => {
      try {
        const response = await fetch("/api/cases");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.value)) {
          // Convert date strings to Date objects
          const processedCases = data.value.map(
            (caseItem: CaseWithFormReply) => ({
              ...caseItem,
              formReply: caseItem.formReply
                ? {
                    ...caseItem.formReply,
                    from: caseItem.formReply.from
                      ? new Date(caseItem.formReply.from)
                      : null,
                    to: caseItem.formReply.to
                      ? new Date(caseItem.formReply.to)
                      : null,
                  }
                : null,
            })
          );
          setCases(processedCases);
        } else {
          console.error("Failed to fetch cases correctly:", data);
          setError("Failed to fetch cases.");
        }
      } catch (error: any) {
        console.error("Failed to fetch new cases:", error);
        setError(error.message);
      }
    };

    const intervalId = setInterval(fetchNewCases, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const calculateMaxHeight = () => {
      if (titleRef.current && headerRef.current && scrollableBodyRef.current) {
        const titleHeight = titleRef.current.offsetHeight;
        const headerHeight = headerRef.current.offsetHeight;
        const availableHeight =
          window.innerHeight - titleHeight - headerHeight - 20; // Adjust 20px for spacing
        scrollableBodyRef.current.style.maxHeight = `${availableHeight}px`;
      }
    };

    calculateMaxHeight(); // Initial calculation

    const handleResize = () => {
      calculateMaxHeight(); // Recalculate on resize
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize); // Cleanup on unmount
    };
  }, []);

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
    // Implement filtering logic here if needed
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <h1 className="w-full my-auto text-7xl text-center font-bold">
          Laster inn...
        </h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center h-full w-full">
        <div className="flex flex-row items-center rounded-3xl bg-yellow-400">
          <BiError className="size-[500px]" />
          <p className="text-5xl font-bold">
            Feil ved lasting av søknader: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-screen min-h-0 max-w-full">
      <div>
        <h1 className="text-3xl md:text-5xl font-bold text-center">
          Permisjonssøknader
        </h1>
        <div className="flex flex-row justify-center gap-3 md:my-5">
          <button
            className={` ${
              activeButton === "Alle" ? "underline " : "hover:opacity-50"
            }`}
            onClick={() => handleButtonClick("Alle")}
          >
            Alle
          </button>
          <button
            className={` ${
              activeButton === "Krever handling"
                ? "underline"
                : "hover:opacity-50"
            }`}
            onClick={() => handleButtonClick("Krever handling")}
          >
            Krever handling
          </button>
          <button
            className={` ${
              activeButton === "Venter" ? "underline " : "hover:opacity-50"
            }`}
            onClick={() => handleButtonClick("Venter")}
          >
            Venter
          </button>
          <button
            className={` ${
              activeButton === "Godkjent" ? "underline " : "hover:opacity-50"
            }`}
            onClick={() => handleButtonClick("Godkjent")}
          >
            Godkjent
          </button>
          <button
            className={` ${
              activeButton === "Avvist" ? "underline " : "hover:opacity-50"
            }`}
            onClick={() => handleButtonClick("Avvist")}
          >
            Avvist
          </button>
          <button
            className={` ${
              activeButton === "Utgått" ? "underline " : "hover:opacity-50"
            }`}
            onClick={() => handleButtonClick("Utgått")}
          >
            Utgått
          </button>
        </div>
      </div>

      <CaseDialog
        open={isDialogOpen}
        data={dialogData}
        user={user}
        onClose={closeDialog}
      />
      <div className="md:mb-10 border-collapse border outline-gray-400 text-center rounded-t-lg shadow-md max-h-8/10 overflow-y-auto overflow-x-auto max-w-full">
        <table className="table-fixed text-sm border-collapse">
          <thead>
            <tr className="bg-eo-lblue sticky top-0">
              <th></th>
              <th className="rounded-tl-sm px-3 py-2">ID</th>
              <th className="px-3 py-2">Navn</th>
              <th className="px-3 py-2">Skiltnr.</th>
              <th className="px-3 py-2">E-post</th>
              <th className="px-3 py-2">Deltakertype</th>
              <th className="px-3 py-2">Tlf.</th>
              <th className="px-3 py-2">Fylke</th>
              <th className="px-3 py-2">Fra</th>
              <th className="px-3 py-2">Til</th>
              <th className="px-3 py-2">Årsak</th>
              <th className="px-3 py-2">Har observatør</th>
              <th className="px-3 py-2">Observatør navn</th>
              <th className="px-3 py-2">Observatør skiltnr.</th>
              <th className="rounded-tr-sm px-3 py-2">Observatør tlf.</th>
            </tr>
          </thead>
          <tbody>
            {cases &&
              cases
                .filter((caseItem: CaseWithFormReply) => caseItem.formReply)
                .map((caseItem: CaseWithFormReply) => (
                  <tr
                    key={caseItem.id}
                    className="border-b transition-colors cursor-pointer odd:bg-gray-100 hover:odd:bg-white hover:text-gray-500 even:bg-[#CEDAE2] hover:even:bg-[#E7ECF0]"
                    onClick={() => openDialog(caseItem)}
                  >
                    <td className="px-3 py-2 border-r-2">
                      {getStatusSymbol(caseItem)}
                    </td>
                    <td className="px-3 py-2 border-r-2">{caseItem.id}</td>
                    <td className="px-3 py-2 border-r-2">
                      {caseItem.formReply?.name}
                    </td>
                    <td className="px-3 py-2 border-r-2">
                      {caseItem.formReply?.participant_id}
                    </td>
                    <td className="px-3 py-2 border-r-2">
                      {caseItem.formReply?.email}
                    </td>
                    <td className="px-3 py-2 border-r-2">
                      {caseItem.formReply?.type === "DELEGATE"
                        ? "Delegat"
                        : "Observatør"}
                    </td>
                    <td className="px-3 py-2 border-r-2">
                      {caseItem.formReply?.tel}
                    </td>
                    <td className="px-3 py-2 border-r-2">
                      {caseItem.formReply?.county}
                    </td>
                    <td className="px-3 py-2 border-r-2">
                      {getDateString(caseItem.formReply?.from || new Date())}
                    </td>
                    <td className="px-3 py-2 border-r-2">
                      {getDateString(caseItem.formReply?.to || new Date())}
                    </td>
                    <td className="px-3 py-2 border-r-2">
                      {caseItem.formReply?.reason}
                    </td>
                    <td className="px-3 py-2">
                      {caseItem.formReply?.has_observer ? (
                        <BiCheckboxChecked className="m-auto size-6" />
                      ) : (
                        <BiCheckbox className="m-auto size-6" />
                      )}
                    </td>
                    <td className="px-3 py-2 border-x-2">
                      {caseItem.formReply?.observer_name}
                    </td>
                    <td className="px-3 py-2 border-r-2">
                      {caseItem.formReply?.observer_id}
                    </td>
                    <td className="px-3 py-2">
                      {caseItem.formReply?.observer_tel}
                    </td>
                  </tr>
                ))}
            {!cases && <p>Failed to load cases.</p>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
