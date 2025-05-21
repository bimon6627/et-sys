import { CaseWithFormReply } from "@/types/case";
import GetCaseStatus from "./ts/get-case-status";
import {
  BiSolidCheckCircle,
  BiSolidCircle,
  BiSolidErrorCircle,
  BiSolidTime,
  BiSolidXCircle,
} from "react-icons/bi";

export default function getStatusSymbol(data: CaseWithFormReply) {
  const status = GetCaseStatus(data);
  const classNameString = "size-6";
  switch (status) {
    case "ACTIVE":
      return (
        <BiSolidCheckCircle className={"text-green-600 " + classNameString} />
      );
    case "SCHEDULED":
      return <BiSolidTime className={"text-emerald-400 " + classNameString} />;
    case "EXPIRED":
      return (
        <BiSolidCheckCircle className={"text-gray-500 " + classNameString} />
      );
    case "PENDING":
      return <BiSolidCircle className={"text-amber-300 " + classNameString} />;
    case "REJECTED":
      return <BiSolidXCircle className={"text-red-600 " + classNameString} />;
    case "ERROR":
      return (
        <BiSolidErrorCircle className={"text-orange-500 " + classNameString} />
      );
  }
}
