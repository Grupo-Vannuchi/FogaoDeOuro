/*
  Warnings:

  - You are about to drop the column `company` on the `testimonials` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `testimonials` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "testimonials" DROP COLUMN "company",
DROP COLUMN "role",
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'Google',
ADD COLUMN     "sourceUrl" TEXT;
