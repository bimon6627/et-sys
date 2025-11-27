export const HmsTypeOptions = {
  ILLNESS: "Sykdom",
  ACCIDENT: "Ulykke/Skade",
  ALLERGY: "Allergisk Reaksjon",
  OTHER: "Annet",
};

// Change 'String' to 'string'
export default function GetHMSType(incidentType: string | null | undefined) {
  if (!incidentType) return "Ukjent";

  // The lookup
  const label = HmsTypeOptions[incidentType as keyof typeof HmsTypeOptions];

  // Return the label if found, otherwise fallback to the raw code or "Ukjent"
  return label || incidentType || "Ukjent";
}
