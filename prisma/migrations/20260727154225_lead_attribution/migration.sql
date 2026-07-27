-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "landingPage" TEXT,
ADD COLUMN     "referrer" TEXT,
ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmSource" TEXT;
