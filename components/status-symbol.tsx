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
        <BiPlusMedical className={"text-green-600 " + classNameString} />
      ) : (
        <BiSolidCheckCircle className={"text-green-600 " + classNameString} />
      );
    case "SCHEDULED":
      return hms ? (
        <BiPlusMedical className={"text-emerald-400 " + classNameString} />
      ) : (
        <BiSolidTime className={"text-emerald-400 " + classNameString} />
      );
    case "EXPIRED":
      return hms ? (
        <BiPlusMedical className={"text-gray-500 " + classNameString} />
      ) : (
        <BiSolidCheckCircle className={"text-gray-500 " + classNameString} />
      );
    case "PENDING":
      return hms ? (
        <BiPlusMedical className={"text-amber-300 " + classNameString} />
      ) : (
        <BiSolidCircle className={"text-amber-300 " + classNameString} />
      );
    case "REJECTED":
      return hms ? (
        <BiPlusMedical className={"text-red-600 " + classNameString} />
      ) : (
        <BiSolidXCircle className={"text-red-600 " + classNameString} />
      );
    case "ERROR":
      return (
        <BiSolidErrorCircle className={"text-orange-500 " + classNameString} />
      );
  }
}
