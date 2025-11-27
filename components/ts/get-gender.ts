const ParticipantGenderOptions = {
  MALE: "Mann",
  FEMALE: "Kvinne",
  OTHER: "Annet",
};

export default function GetGender(
  participantGender: string | null | undefined
) {
  if (!participantGender) return "Ukjent";

  // The lookup
  const label =
    ParticipantGenderOptions[
      participantGender as keyof typeof ParticipantGenderOptions
    ];

  // Return the label if found, otherwise fallback to the raw code or "Ukjent"
  return label || participantGender || "Ukjent";
}
