-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Case" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "formReplyId" INTEGER NOT NULL,
    "id_swapped" BOOLEAN NOT NULL,
    "status" BOOLEAN NOT NULL,
    "reason_rejected" TEXT,
    "comment" TEXT,
    "reviewedById" INTEGER,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    CONSTRAINT "Case_formReplyId_fkey" FOREIGN KEY ("formReplyId") REFERENCES "FormReply" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Case" ("comment", "formReplyId", "id", "id_swapped", "reason_rejected", "reviewedAt", "reviewedBy", "reviewedById", "status") SELECT "comment", "formReplyId", "id", "id_swapped", "reason_rejected", "reviewedAt", "reviewedBy", "reviewedById", "status" FROM "Case";
DROP TABLE "Case";
ALTER TABLE "new_Case" RENAME TO "Case";
CREATE UNIQUE INDEX "Case_formReplyId_key" ON "Case"("formReplyId");
CREATE TABLE "new_FormReply" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tel" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "from" DATETIME NOT NULL,
    "to" DATETIME NOT NULL,
    "reason" TEXT NOT NULL,
    "has_observer" BOOLEAN,
    "observer_name" TEXT,
    "observer_id" TEXT,
    "observer_tel" TEXT
);
INSERT INTO "new_FormReply" ("county", "email", "from", "has_observer", "id", "name", "observer_id", "observer_name", "observer_tel", "participant_id", "reason", "tel", "to", "type") SELECT "county", "email", "from", "has_observer", "id", "name", "observer_id", "observer_name", "observer_tel", "participant_id", "reason", "tel", "to", "type" FROM "FormReply";
DROP TABLE "FormReply";
ALTER TABLE "new_FormReply" RENAME TO "FormReply";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
