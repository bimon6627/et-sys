/*
  Warnings:

  - Added the required column `county` to the `FormReply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `FormReply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `FormReply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tel` to the `FormReply` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FormReply" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tel" INTEGER NOT NULL,
    "county" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "participant_id" INTEGER NOT NULL,
    "from" DATETIME NOT NULL,
    "to" DATETIME NOT NULL,
    "transfer_type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "observer_name" TEXT,
    "observer_id" INTEGER,
    "observer_tel" INTEGER
);
INSERT INTO "new_FormReply" ("from", "id", "participant_id", "reason", "to", "transfer_type", "type") SELECT "from", "id", "participant_id", "reason", "to", "transfer_type", "type" FROM "FormReply";
DROP TABLE "FormReply";
ALTER TABLE "new_FormReply" RENAME TO "FormReply";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
