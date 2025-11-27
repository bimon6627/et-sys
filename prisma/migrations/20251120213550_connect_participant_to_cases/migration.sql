-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "participantObjectId" INTEGER;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_participantObjectId_fkey" FOREIGN KEY ("participantObjectId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
