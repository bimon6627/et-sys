import { CaseWithFormReply } from "@/types/case";

export default function GetCaseStatus(caseData: CaseWithFormReply) {
  const caseStatus = caseData.status;
  const caseFrom = caseData.formReply?.from;
  const caseTo = caseData.formReply?.to;
  if (!caseFrom || !caseTo) {
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
    } else if (caseFrom < now) {
      return "SCHEDULED";
    } else {
      return "ACTIVE";
    }
  }
}
