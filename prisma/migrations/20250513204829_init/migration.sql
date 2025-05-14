-- CreateTable
CREATE TABLE "FormReply" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "participant_id" INTEGER NOT NULL,
    "from" DATETIME NOT NULL,
    "to" DATETIME NOT NULL,
    "transfer_type" TEXT NOT NULL,
    "reason" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Case" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "formReplyId" INTEGER NOT NULL,
    "id_swapped" BOOLEAN NOT NULL,
    "status" BOOLEAN NOT NULL,
    "reason_rejected" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "reviewedById" INTEGER NOT NULL,
    "reviewedBy" TEXT NOT NULL,
    "reviewedAt" DATETIME NOT NULL,
    CONSTRAINT "Case_formReplyId_fkey" FOREIGN KEY ("formReplyId") REFERENCES "FormReply" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Case_formReplyId_key" ON "Case"("formReplyId");
