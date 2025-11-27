export default function GetParticipantReturning(
  toDate: Date,
  condigDateEnd: string
) {
  if (condigDateEnd == "") return null;
  const endDate = new Date(condigDateEnd);
  if (toDate > endDate) {
    return false;
  } else {
    return true;
  }
}
