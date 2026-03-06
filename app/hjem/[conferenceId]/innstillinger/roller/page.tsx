// app/hjem/[conferenceId]/innstillinger/roller/page.tsx

import {
  getConferenceRoles,
  getSafePermissions,
} from "@/app/actions/conference-role-actions";
import RoleListClient from "@/components/conference/role-list-client";

export default async function ConferenceRolesPage({
  params,
}: {
  params: Promise<{ conferenceId: string }>;
}) {
  const { conferenceId } = await params;

  // Fetch data in parallel
  const [roles, safePermissions] = await Promise.all([
    getConferenceRoles(conferenceId),
    getSafePermissions(),
  ]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Roller & Tilganger
          </h1>
          <p className="text-gray-500 text-sm">
            Definer hva de ulike arrangørene har tilgang til i denne
            konferansen.
          </p>
        </div>
      </div>

      <RoleListClient
        roles={roles}
        allPermissions={safePermissions}
        shortname={conferenceId}
      />
    </div>
  );
}
