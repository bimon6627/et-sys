-- CreateEnum
CREATE TYPE "HmsType" AS ENUM ('ILLNESS', 'ACCIDENT', 'ALLERGY', 'OTHER');

-- CreateTable
CREATE TABLE "HMS" (
    "id" SERIAL NOT NULL,
    "incidentType" "HmsType" NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "timeOfIncident" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "participantId" TEXT,
    "participantName" TEXT,
    "reportedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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

-- AddForeignKey
ALTER TABLE "HMS" ADD CONSTRAINT "HMS_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "Whitelist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HMS_actions" ADD CONSTRAINT "HMS_actions_hmsIncidentId_fkey" FOREIGN KEY ("hmsIncidentId") REFERENCES "HMS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HMS_actions" ADD CONSTRAINT "HMS_actions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Whitelist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
