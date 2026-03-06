-- CreateEnum
CREATE TYPE "HmsType" AS ENUM ('ILLNESS', 'ACCIDENT', 'ALLERGY', 'OTHER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "ParticipantType" AS ENUM ('DELEGATE', 'OBSERVER');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('INFO', 'WARN', 'ERROR', 'CRITICAL', 'FATAL', 'DEBUG');

-- CreateTable
CREATE TABLE "Whitelist" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "profilePictureURL" TEXT,
    "roleId" INTEGER,
    "regionId" INTEGER,

    CONSTRAINT "Whitelist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isSystemPermission" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "global" BOOLEAN NOT NULL DEFAULT false,
    "internal" BOOLEAN NOT NULL DEFAULT false,
    "parentId" INTEGER,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "canVote" BOOLEAN NOT NULL,
    "regionId" INTEGER NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conference" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "shortname" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "global" BOOLEAN NOT NULL DEFAULT false,
    "regionId" INTEGER,

    CONSTRAINT "Conference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConferenceRole" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "conferenceId" INTEGER,

    CONSTRAINT "ConferenceRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConferenceOrganizer" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "conferenceId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "ConferenceOrganizer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" SERIAL NOT NULL,
    "conferenceId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tel" TEXT NOT NULL,
    "type" "ParticipantType" NOT NULL,
    "participant_id" TEXT,
    "gender" "Gender" NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "mealPreference" TEXT,
    "allergy" TEXT,
    "hotel" TEXT,
    "arrival" TEXT,
    "departure" TEXT,
    "family" TEXT NOT NULL,
    "family_relation" TEXT NOT NULL,
    "family_tel" TEXT NOT NULL,
    "school_contact" TEXT NOT NULL,
    "school_contact_relation" TEXT NOT NULL,
    "school_contact_tel" TEXT NOT NULL,
    "previousConferences" INTEGER NOT NULL,
    "elected_representative" BOOLEAN NOT NULL,
    "docs_approved_once" BOOLEAN NOT NULL DEFAULT false,
    "docs_approved_twice" BOOLEAN NOT NULL DEFAULT false,
    "room_number" TEXT,
    "notes" TEXT,
    "checked_in" BOOLEAN NOT NULL DEFAULT false,
    "isAbsent" BOOLEAN NOT NULL DEFAULT false,
    "regionId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormReply" (
    "id" SERIAL NOT NULL,
    "conferenceId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tel" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "type" "ParticipantType" NOT NULL,
    "participant_id" TEXT NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "has_observer" BOOLEAN,
    "observer_name" TEXT,
    "observer_id" TEXT,
    "observer_tel" TEXT,

    CONSTRAINT "FormReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" SERIAL NOT NULL,
    "conferenceId" INTEGER NOT NULL,
    "formReplyId" INTEGER NOT NULL,
    "id_swapped" BOOLEAN NOT NULL DEFAULT false,
    "status" BOOLEAN,
    "reason_rejected" TEXT,
    "comment" TEXT,
    "reviewedById" INTEGER,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "hmsFlag" BOOLEAN NOT NULL DEFAULT false,
    "hmsIncidentId" INTEGER,
    "participantObjectId" INTEGER,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HMS" (
    "id" SERIAL NOT NULL,
    "conferenceId" INTEGER NOT NULL,
    "incidentType" "HmsType" NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "timeOfIncident" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "participantId" TEXT,
    "participantName" TEXT,
    "participantObjectId" INTEGER,
    "reportedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "caseId" INTEGER,

    CONSTRAINT "HMS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HMS_actions" (
    "id" SERIAL NOT NULL,
    "hmsIncidentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HMS_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Config" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" SERIAL NOT NULL,
    "level" "LogLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "userId" INTEGER,
    "conferenceId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PermissionToRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ConferenceRoleToPermission" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ConferenceRoleToPermission_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Whitelist_email_key" ON "Whitelist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_slug_key" ON "Permission"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Region_name_key" ON "Region"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Conference_shortname_key" ON "Conference"("shortname");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_email_conferenceId_key" ON "Participant"("email", "conferenceId");

-- CreateIndex
CREATE UNIQUE INDEX "Case_formReplyId_key" ON "Case"("formReplyId");

-- CreateIndex
CREATE UNIQUE INDEX "Case_hmsIncidentId_key" ON "Case"("hmsIncidentId");

-- CreateIndex
CREATE UNIQUE INDEX "HMS_caseId_key" ON "HMS"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "Config_key_key" ON "Config"("key");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- CreateIndex
CREATE INDEX "_ConferenceRoleToPermission_B_index" ON "_ConferenceRoleToPermission"("B");

-- AddForeignKey
ALTER TABLE "Whitelist" ADD CONSTRAINT "Whitelist_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Whitelist" ADD CONSTRAINT "Whitelist_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conference" ADD CONSTRAINT "Conference_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConferenceRole" ADD CONSTRAINT "ConferenceRole_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConferenceOrganizer" ADD CONSTRAINT "ConferenceOrganizer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Whitelist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConferenceOrganizer" ADD CONSTRAINT "ConferenceOrganizer_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConferenceOrganizer" ADD CONSTRAINT "ConferenceOrganizer_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ConferenceRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormReply" ADD CONSTRAINT "FormReply_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_formReplyId_fkey" FOREIGN KEY ("formReplyId") REFERENCES "FormReply"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_participantObjectId_fkey" FOREIGN KEY ("participantObjectId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HMS" ADD CONSTRAINT "HMS_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HMS" ADD CONSTRAINT "HMS_participantObjectId_fkey" FOREIGN KEY ("participantObjectId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HMS" ADD CONSTRAINT "HMS_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "Whitelist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HMS" ADD CONSTRAINT "HMS_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HMS_actions" ADD CONSTRAINT "HMS_actions_hmsIncidentId_fkey" FOREIGN KEY ("hmsIncidentId") REFERENCES "HMS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HMS_actions" ADD CONSTRAINT "HMS_actions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Whitelist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConferenceRoleToPermission" ADD CONSTRAINT "_ConferenceRoleToPermission_A_fkey" FOREIGN KEY ("A") REFERENCES "ConferenceRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConferenceRoleToPermission" ADD CONSTRAINT "_ConferenceRoleToPermission_B_fkey" FOREIGN KEY ("B") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
