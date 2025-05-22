"use client";
import { useState, useEffect, useRef, useMemo } from "react"; // Import useEffect
import {
  BiCheckbox,
  BiError,
  BiSolidCheckboxChecked,
  BiSolidDownArrow,
  BiSolidSortAlt,
  BiSolidUpArrow,
} from "react-icons/bi";
import { CaseWithFormReply, FormReply } from "@/types/case";
import CaseDialog from "./case-dialog";
import getStatusSymbol from "./status-symbol";
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();
  const [cases, setCases] = useState(initialCases); // Use state for cases
  const [activeButton, setActiveButton] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState(initialCases[0]); // State to hold the JSON object
  const [sortColumn, setSortColumn] = useState<keyof FormReply | null>(null); // Column to sort by
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc"); // Sort direction

  const titleRef = useRef<HTMLDivElement>(null); // Assuming your buttons are in a div
  const headerRef = useRef<HTMLTableSectionElement>(null);
  const scrollableBodyRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef(activeButton);
  const sessionRef = useRef(session);

  useEffect(() => {
    activeButtonRef.current = activeButton;
    fetchNewCases();
  }, [activeButton]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const openDialog = (caseData: CaseWithFormReply) => {
    setDialogData(caseData);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  useEffect(() => {
    if (user !== undefined) {
      setLoading(false);
    }
  }, [user]);

  const fetchNewCases = async () => {
    const condition = activeButtonRef.current;
    const url = `/api/cases?status=${condition}`;
    console.log(sessionRef.current?.accessToken);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionRef.current?.accessToken}`,
        },
      });
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
    } catch (error: unknown) {
      // Change 'any' to 'unknown'
      console.error("Failed to fetch new cases:", error);

      // Safely check if error is an instance of Error before accessing .message
      if (error instanceof Error) {
        setError(error.message);
      } else {
        // Handle cases where the error might not be an Error object (e.g., a string or an object)
        setError("An unknown error occurred.");
        // Or if you want to be more specific:
        // setError(String(error)); // Convert whatever 'error' is to a string
      }
    }
  };

  useEffect(() => {
    if (!session?.accessToken) return;

    const intervalId = setInterval(() => {
      const currentSession = sessionRef.current;
      console.log("Interval fetch with sessionRef:", currentSession);
      if (!currentSession?.accessToken) return;
      fetchNewCases();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [session]);

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
  };

  const handleSortClick = (column: keyof FormReply) => {
    if (sortColumn === column) {
      // If clicking the same column, toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // If clicking a new column, set it as the sort column and default to ascending
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const isEmptySortValue = (
    value: string | number | boolean | Date | null | undefined
  ): boolean => {
    return (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "")
    );
  };

  const sortedCases = useMemo(() => {
    if (!sortColumn) {
      return cases; // No sorting applied
    }

    const sortableCases = [...cases]; // Create a shallow copy

    sortableCases.sort((a, b) => {
      const aFormReply = a.formReply;
      const bFormReply = b.formReply;

      // First, handle cases where formReply itself might be null or undefined
      // This ensures cases without a formReply are consistently positioned.
      // Let's decide to always push them to the end, regardless of direction.
      if (!aFormReply && !bFormReply) return 0;
      if (!aFormReply) return 1; // 'a' is missing formReply, push to end
      if (!bFormReply) return -1; // 'b' is missing formReply, push to end

      // Now we are sure aFormReply and bFormReply exist.
      // Get the values for the current sortColumn.
      // Use non-null assertion `!` because we check `sortColumn` at the top and `formReply` just above.
      const aValue = aFormReply[sortColumn!];
      const bValue = bFormReply[sortColumn!];

      const aIsEmpty = isEmptySortValue(aValue);
      const bIsEmpty = isEmptySortValue(bValue);

      // --- CRITICAL CHANGE FOR EMPTY VALUES ---
      // If both are empty, consider them equal in terms of sort order.
      if (aIsEmpty && bIsEmpty) return 0;
      // If only 'a' is empty, 'a' comes after 'b' (push empty to end).
      if (aIsEmpty) return 1;
      // If only 'b' is empty, 'b' comes after 'a' (push empty to end).
      if (bIsEmpty) return -1;
      // --- END CRITICAL CHANGE ---

      // At this point, both aValue and bValue are guaranteed to be non-empty.
      // Proceed with type-specific comparison.
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (aValue instanceof Date && bValue instanceof Date) {
        const aTime = aValue.getTime();
        const bTime = bValue.getTime();
        return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      } else if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        const aBool = aValue ? 1 : 0;
        const bBool = bValue ? 1 : 0;
        return sortDirection === "asc" ? aBool - bBool : bBool - aBool;
      }
      // Fallback: If types are unknown or mixed, treat as equal.
      // You might want to handle this case more specifically if other types are possible.
      return 0;
    });

    return sortableCases;
  }, [cases, sortColumn, sortDirection]);

  const renderSortIcon = (column: keyof FormReply) => {
    if (sortColumn !== column) {
      return <BiSolidSortAlt className="ml-1" />;
    }
    if (sortDirection === "desc") {
      return <BiSolidUpArrow className="ml-1" />;
    }
    return <BiSolidDownArrow className="ml-1" />;
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
      <div className="flex flex-col max-h-screen min-h-0 max-w-full">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-center">
            Permisjonssøknader
          </h1>
          <div className="flex flex-row justify-center gap-3 md:my-5">
            <button
              className={` ${
                activeButton === "ALL" ? "underline " : "hover:opacity-50"
              }`}
              onClick={() => handleButtonClick("ALL")}
            >
              Alle
            </button>
            <button
              className={` ${
                activeButton === "REQUIRE_ACTION"
                  ? "underline"
                  : "hover:opacity-50"
              }`}
              onClick={() => handleButtonClick("REQUIRE_ACTION")}
            >
              Krever handling
            </button>
            <button
              className={` ${
                activeButton === "PENDING" ? "underline " : "hover:opacity-50"
              }`}
              onClick={() => handleButtonClick("PENDING")}
            >
              Ikke behandlet
            </button>
            <button
              className={` ${
                activeButton === "APPROVED" ? "underline " : "hover:opacity-50"
              }`}
              onClick={() => handleButtonClick("APPROVED")}
            >
              Godkjent
            </button>
            <button
              className={` ${
                activeButton === "REJECTED" ? "underline " : "hover:opacity-50"
              }`}
              onClick={() => handleButtonClick("REJECTED")}
            >
              Avvist
            </button>
            <button
              className={` ${
                activeButton === "EXPIRED" ? "underline " : "hover:opacity-50"
              }`}
              onClick={() => handleButtonClick("EXPIRED")}
            >
              Utgått
            </button>
          </div>
        </div>
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
        <h1 className="text-3xl mt-5 md:text-5xl font-bold text-center">
          Permisjonssøknader
        </h1>
        <div className="flex flex-row justify-center gap-3 md:my-5">
          <button
            className={` ${
              activeButton === "ALL" ? "underline " : "hover:opacity-50"
            }`}
            onClick={() => handleButtonClick("ALL")}
          >
            Alle
          </button>
          <button
            className={` ${
              activeButton === "REQUIRE_ACTION"
                ? "underline"
                : "hover:opacity-50"
            }`}
            onClick={() => handleButtonClick("REQUIRE_ACTION")}
          >
            Krever handling
          </button>
          <button
            className={` ${
              activeButton === "PENDING" ? "underline " : "hover:opacity-50"
            }`}
            onClick={() => handleButtonClick("PENDING")}
          >
            Ikke behandlet
          </button>
          <button
            className={` ${
              activeButton === "APPROVED" ? "underline " : "hover:opacity-50"
            }`}
            onClick={() => handleButtonClick("APPROVED")}
          >
            Godkjent
          </button>
          <button
            className={` ${
              activeButton === "REJECTED" ? "underline " : "hover:opacity-50"
            }`}
            onClick={() => handleButtonClick("REJECTED")}
          >
            Avvist
          </button>
          <button
            className={` ${
              activeButton === "EXPIRED" ? "underline " : "hover:opacity-50"
            }`}
            onClick={() => handleButtonClick("EXPIRED")}
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
      <div className="md:mb-10 border-collapse border outline-gray-400 text-center rounded-t-lg shadow-md max-h-8/10 overflow-y-auto overflow-x-auto max-w-8/10">
        <table className="table-auto w-full text-sm border-collapse">
          <thead>
            <tr className="bg-eo-lblue sticky top-0">
              <th></th>
              <th className="rounded-tl-s">
                <div className="flex flex-row items-center justify-center py-1">
                  <p>ID</p>
                  <a onClick={() => handleSortClick("id")}>
                    {renderSortIcon("id")}
                  </a>
                </div>
              </th>
              <th>
                <div className="flex flex-row items-center justify-center py-1">
                  <p>Navn</p>
                  <a onClick={() => handleSortClick("name")}>
                    {renderSortIcon("name")}
                  </a>
                </div>
              </th>
              <th>
                <div className="flex flex-row items-center justify-center py-1">
                  <p>Skiltnr.</p>
                  <a onClick={() => handleSortClick("participant_id")}>
                    {renderSortIcon("participant_id")}
                  </a>
                </div>
              </th>
              <th>
                <div className="flex flex-row items-center justify-center py-1">
                  <p>E-post.</p>
                  <a onClick={() => handleSortClick("email")}>
                    {renderSortIcon("email")}
                  </a>
                </div>
              </th>
              <th>
                <div className="flex flex-row items-center justify-center py-1">
                  <p>Deltakertype</p>
                  <a onClick={() => handleSortClick("type")}>
                    {renderSortIcon("type")}
                  </a>
                </div>
              </th>
              <th>
                <div className="flex flex-row items-center justify-center py-1">
                  <p>Tlf</p>
                  <a onClick={() => handleSortClick("tel")}>
                    {renderSortIcon("tel")}
                  </a>
                </div>
              </th>
              <th>
                <div className="flex flex-row items-center justify-center py-1">
                  <p>Fylke</p>
                  <a onClick={() => handleSortClick("county")}>
                    {renderSortIcon("county")}
                  </a>
                </div>
              </th>
              <th>
                <div className="flex flex-row items-center justify-center py-1">
                  <p>Fra</p>
                  <a onClick={() => handleSortClick("from")}>
                    {renderSortIcon("from")}
                  </a>
                </div>
              </th>
              <th>
                <div className="flex flex-row items-center justify-center py-1">
                  <p>Til</p>
                  <a onClick={() => handleSortClick("to")}>
                    {renderSortIcon("to")}
                  </a>
                </div>
              </th>
              <th>
                <div className="flex flex-row items-center justify-center py-1">
                  <p>Årsak</p>
                  <a onClick={() => handleSortClick("reason")}>
                    {renderSortIcon("reason")}
                  </a>
                </div>
              </th>
              <th>
                <div className="flex flex-row items-center justify-center py-1">
                  <p>Har observatør</p>
                  <a onClick={() => handleSortClick("has_observer")}>
                    {renderSortIcon("has_observer")}
                  </a>
                </div>
              </th>
              <th>
                <div className="flex flex-row items-center justify-center py-1">
                  <p>Observatør navn</p>
                  <a onClick={() => handleSortClick("observer_name")}>
                    {renderSortIcon("observer_name")}
                  </a>
                </div>
              </th>
              <th>
                <div className="flex flex-row items-center justify-center py-1">
                  <p>Observatør skiltnr.</p>
                  <a onClick={() => handleSortClick("observer_id")}>
                    {renderSortIcon("observer_id")}
                  </a>
                </div>
              </th>
              <th>
                <div className="flex flex-row items-center justify-center py-1">
                  <p>Observatør tlf</p>
                  <a onClick={() => handleSortClick("observer_tel")}>
                    {renderSortIcon("observer_tel")}
                  </a>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCases &&
              sortedCases
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
                        <BiSolidCheckboxChecked className="m-auto size-6" />
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
