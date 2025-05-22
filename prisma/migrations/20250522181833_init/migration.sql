-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'KONKOM', 'SEK', 'SST');

-- CreateEnum
CREATE TYPE "ParticipantType" AS ENUM ('DELEGATE', 'OBSERVER');

-- CreateTable
CREATE TABLE "Whitelist" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "Whitelist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormReply" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tel" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "type" "ParticipantType" NOT NULL,
    "participant_id" TEXT NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "has_observer" BOOLEAN,
    "observer_name" TEXT,
    "observer_id" TEXT,
    "observer_tel" TEXT,

    CONSTRAINT "FormReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" SERIAL NOT NULL,
    "formReplyId" INTEGER NOT NULL,
    "id_swapped" BOOLEAN NOT NULL,
    "status" BOOLEAN,
    "reason_rejected" TEXT,
    "comment" TEXT,
    "reviewedById" INTEGER,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "hmsFlag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Config" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Whitelist_email_key" ON "Whitelist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Case_formReplyId_key" ON "Case"("formReplyId");

-- CreateIndex
CREATE UNIQUE INDEX "Config_key_key" ON "Config"("key");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_formReplyId_fkey" FOREIGN KEY ("formReplyId") REFERENCES "FormReply"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
