/*
  Warnings:

  - You are about to drop the column `from_day` on the `FormReply` table. All the data in the column will be lost.
  - You are about to drop the column `from_time` on the `FormReply` table. All the data in the column will be lost.
  - You are about to drop the column `to_day` on the `FormReply` table. All the data in the column will be lost.
  - You are about to drop the column `to_time` on the `FormReply` table. All the data in the column will be lost.
  - Added the required column `from` to the `FormReply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to` to the `FormReply` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL
);

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
    "reason" TEXT NOT NULL,
    "has_observer" BOOLEAN,
    "observer_name" TEXT,
    "observer_id" INTEGER,
    "observer_tel" INTEGER
);
INSERT INTO "new_FormReply" ("county", "email", "has_observer", "id", "name", "observer_id", "observer_name", "observer_tel", "participant_id", "reason", "tel", "type") SELECT "county", "email", "has_observer", "id", "name", "observer_id", "observer_name", "observer_tel", "participant_id", "reason", "tel", "type" FROM "FormReply";
DROP TABLE "FormReply";
ALTER TABLE "new_FormReply" RENAME TO "FormReply";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Config_key_key" ON "Config"("key");
