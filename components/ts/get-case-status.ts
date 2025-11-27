import { CaseWithFormReply } from "@/types/case";

export default function GetCaseStatus(caseData: CaseWithFormReply) {
  const caseStatus = caseData.status;
  const swapped = caseData.id_swapped;
  const has_observer = caseData.formReply?.has_observer;
  const caseFrom = caseData.formReply?.from;
  const caseTo = caseData.formReply?.to;
  if (!caseFrom || !caseTo || caseTo < caseFrom) {
    return "ERROR";
  } else if (caseStatus === null) {
    return "PENDING";
  } else if (caseStatus === false) {
    return "REJECTED";
  } else {
    //Approved
    const now = new Date();
    if (caseTo < now) {
      return "EXPIRED";
    } else if (caseFrom > now) {
      return "SCHEDULED";
    } else if (has_observer && !swapped) {
      return "SWAP";
    } else {
      return "ACTIVE";
    }
  }
}
