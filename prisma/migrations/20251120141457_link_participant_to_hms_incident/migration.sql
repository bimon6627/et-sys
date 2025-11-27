/*
  Warnings:

  - A unique constraint covering the columns `[hmsIncidentId]` on the table `Case` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[caseId]` on the table `HMS` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "hmsIncidentId" INTEGER;

-- AlterTable
ALTER TABLE "HMS" ADD COLUMN     "caseId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Case_hmsIncidentId_key" ON "Case"("hmsIncidentId");

-- CreateIndex
CREATE UNIQUE INDEX "HMS_caseId_key" ON "HMS"("caseId");

-- AddForeignKey
ALTER TABLE "HMS" ADD CONSTRAINT "HMS_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;
