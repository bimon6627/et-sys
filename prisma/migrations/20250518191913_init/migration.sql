-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Case" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "formReplyId" INTEGER NOT NULL,
    "id_swapped" BOOLEAN NOT NULL,
    "status" BOOLEAN,
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
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
