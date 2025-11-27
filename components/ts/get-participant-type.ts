const ParticipantTypeOptions = {
  DELEGATE: "Delegat",
  OBSERVER: "Observatør",
};

export default function GetParticipantType(
  participantType: string | null | undefined
) {
  if (!participantType) return "Ukjent";

  // The lookup
  const label =
    ParticipantTypeOptions[
      participantType as keyof typeof ParticipantTypeOptions
    ];

  // Return the label if found, otherwise fallback to the raw code or "Ukjent"
  return label || participantType || "Ukjent";
}
