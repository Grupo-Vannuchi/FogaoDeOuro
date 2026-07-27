-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "whatsappNotifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "lead_notification_config" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "instance" TEXT,
    "groupId" TEXT,
    "groupName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_notification_config_pkey" PRIMARY KEY ("id")
);
