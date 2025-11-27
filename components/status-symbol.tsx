import { CaseWithFormReply } from "@/types/case";
import GetCaseStatus from "./ts/get-case-status";
import {
  BiPlusMedical,
  BiSolidCheckCircle,
  BiSolidCircle,
  BiSolidErrorCircle,
  BiSolidTime,
  BiSolidXCircle,
} from "react-icons/bi";

export default function getStatusSymbol(data: CaseWithFormReply) {
  const status = GetCaseStatus(data);
  const hms = data.hmsFlag;
  const classNameString = "size-6";
  switch (status) {
    case "ACTIVE":
      return hms ? (
        <BiPlusMedical
          title="Aktiv HMS permisjon"
          className={"text-green-600 " + classNameString}
        />
      ) : (
        <BiSolidCheckCircle
          title="Aktiv permisjon"
          className={"text-green-600 " + classNameString}
        />
      );
    case "SCHEDULED":
      return hms ? (
        <BiPlusMedical
          title="Godkjent HMS permisjon"
          className={"text-emerald-400 " + classNameString}
        />
      ) : (
        <BiSolidTime
          title="Godkjent permisjon"
          className={"text-emerald-400 " + classNameString}
        />
      );
    case "EXPIRED":
      return hms ? (
        <BiPlusMedical
          title="Utgått HMS permisjon"
          className={"text-gray-500 " + classNameString}
        />
      ) : (
        <BiSolidCheckCircle
          title="Utgått permisjon"
          className={"text-gray-500 " + classNameString}
        />
      );
    case "PENDING":
      return hms ? (
        <BiPlusMedical
          title="Venter på behandling, HMS"
          className={"text-amber-300 " + classNameString}
        />
      ) : (
        <BiSolidCircle
          title="Venter på behandling"
          className={"text-amber-300 " + classNameString}
        />
      );
    case "REJECTED":
      return hms ? (
        <BiPlusMedical
          title="Avvist HMS permisjon"
          className={"text-red-600 " + classNameString}
        />
      ) : (
        <BiSolidXCircle
          title="Avvist permisjon"
          className={"text-red-600 " + classNameString}
        />
      );
    case "SWAP":
      return hms ? (
        <BiPlusMedical
          title="Bytt skiltnummer"
          className={"text-blue-600 " + classNameString}
        />
      ) : (
        <BiSolidErrorCircle
          title="Bytt skiltnummer"
          className={"text-blue-600 " + classNameString}
        />
      );
    case "ERROR":
      return (
        <BiSolidErrorCircle
          title="En feil har oppstått..."
          className={"text-orange-500 " + classNameString}
        />
      );
  }
}
