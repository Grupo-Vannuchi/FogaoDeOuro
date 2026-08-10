/*
  Warnings:

  - You are about to drop the `funnel_default_templates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `funnel_endings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `funnel_questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `funnel_submissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `funnels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `google_account` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "funnel_endings" DROP CONSTRAINT "funnel_endings_funnelId_fkey";

-- DropForeignKey
ALTER TABLE "funnel_questions" DROP CONSTRAINT "funnel_questions_funnelId_fkey";

-- DropForeignKey
ALTER TABLE "funnel_submissions" DROP CONSTRAINT "funnel_submissions_funnelId_fkey";

-- DropTable
DROP TABLE "funnel_default_templates";

-- DropTable
DROP TABLE "funnel_endings";

-- DropTable
DROP TABLE "funnel_questions";

-- DropTable
DROP TABLE "funnel_submissions";

-- DropTable
DROP TABLE "funnels";

-- DropTable
DROP TABLE "google_account";

-- DropEnum
DROP TYPE "FunnelOutcome";

-- DropEnum
DROP TYPE "FunnelQuestionKind";

-- DropEnum
DROP TYPE "FunnelStatus";

-- DropEnum
DROP TYPE "FunnelType";

-- DropEnum
DROP TYPE "WhatsappStatus";
