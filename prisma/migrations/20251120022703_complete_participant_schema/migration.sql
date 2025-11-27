/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Participant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dob` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `elected_representative` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `family` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `family_relation` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `family_tel` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previousConferences` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_contact` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_contact_relation` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_contact_tel` to the `Participant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "allergy" TEXT,
ADD COLUMN     "arrival" TEXT,
ADD COLUMN     "checked_in" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "departure" TEXT,
ADD COLUMN     "dob" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "docs_approved_once" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "docs_approved_twice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "elected_representative" BOOLEAN NOT NULL,
ADD COLUMN     "family" TEXT NOT NULL,
ADD COLUMN     "family_relation" TEXT NOT NULL,
ADD COLUMN     "family_tel" TEXT NOT NULL,
ADD COLUMN     "hotel" TEXT,
ADD COLUMN     "mealPreference" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "previousConferences" INTEGER NOT NULL,
ADD COLUMN     "room_number" TEXT,
ADD COLUMN     "school_contact" TEXT NOT NULL,
ADD COLUMN     "school_contact_relation" TEXT NOT NULL,
ADD COLUMN     "school_contact_tel" TEXT NOT NULL,
ALTER COLUMN "participant_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Participant_email_key" ON "Participant"("email");
