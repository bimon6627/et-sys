/*
  Warnings:

  - You are about to drop the column `from` on the `FormReply` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `FormReply` table. All the data in the column will be lost.
  - You are about to drop the column `transfer_type` on the `FormReply` table. All the data in the column will be lost.
  - Added the required column `from_day` to the `FormReply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `from_time` to the `FormReply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to_day` to the `FormReply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to_time` to the `FormReply` table without a default value. This is not possible if the table is not empty.

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
    "from_day" INTEGER NOT NULL,
    "from_time" DATETIME NOT NULL,
    "to_day" INTEGER NOT NULL,
    "to_time" DATETIME NOT NULL,
    "reason" TEXT NOT NULL,
    "has_observer" BOOLEAN,
    "observer_name" TEXT,
    "observer_id" INTEGER,
    "observer_tel" INTEGER
);
INSERT INTO "new_FormReply" ("county", "email", "id", "name", "observer_id", "observer_name", "observer_tel", "participant_id", "reason", "tel", "type") SELECT "county", "email", "id", "name", "observer_id", "observer_name", "observer_tel", "participant_id", "reason", "tel", "type" FROM "FormReply";
DROP TABLE "FormReply";
ALTER TABLE "new_FormReply" RENAME TO "FormReply";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
