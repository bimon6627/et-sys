-- AlterTable
ALTER TABLE "HMS" ADD COLUMN     "participantObjectId" INTEGER;

-- AddForeignKey
ALTER TABLE "HMS" ADD CONSTRAINT "HMS_participantObjectId_fkey" FOREIGN KEY ("participantObjectId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
