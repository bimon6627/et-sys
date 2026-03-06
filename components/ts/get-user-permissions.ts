import { type Session } from "next-auth";

// Define the shape of the user object we expect
// (This matches the extended session type we created in auth.ts)
type User = Session["user"];

export default function getUserPermissions(
  conferenceShortname: string | undefined,
  user: User | undefined,
): string[] {
  if (!user) return [];
  if (!conferenceShortname) return user.permissions || [];

  // 1. Get Global Permissions
  // (In our auth.ts, we flattened this to user.permissions)
  const globalPermissions = user.permissions || [];

  // 2. Find Conference Specific Permissions
  // We look for a conference where the name matches the shortname (case-insensitive)
  const conferenceData = user.organizedConferences?.find(
    (conf) =>
      conf.conferenceShortname?.toLowerCase() ===
      conferenceShortname.toLowerCase(),
  );

  const conferencePermissions = conferenceData?.permissions || [];

  // 3. Merge and Deduplicate
  // specific permissions + global permissions = all effective permissions
  return concatUnique(globalPermissions, conferencePermissions);
}

// Helper to combine arrays and remove duplicates
function concatUnique(arr1: string[], arr2: string[]): string[] {
  // A Set automatically removes duplicates
  const uniqueSet = new Set([...arr1, ...arr2]);

  // Convert back to array
  return Array.from(uniqueSet);
}
