/*
  Warnings:

  - The values [CAREER] on the enum `LeadType` will be removed. If these variants are used in the database, this will fail.
  - You are about to drop the column `role` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `portfolio` on the `leads` table. All the data in the column will be lost.

*/
-- Converte o residuo do seed da agencia antes de remover o valor do enum:
-- Postgres recusa remover um valor em uso. Converter em vez de apagar — a
-- linha registra um envio real de formulario, e os campos especificos de
-- carreira estao sendo descartados de qualquer forma.
UPDATE "leads" SET "type" = 'CONTACT' WHERE "type" = 'CAREER';

-- AlterEnum
BEGIN;
CREATE TYPE "LeadType_new" AS ENUM ('CONTACT');
ALTER TABLE "public"."leads" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "leads" ALTER COLUMN "type" TYPE "LeadType_new" USING ("type"::text::"LeadType_new");
ALTER TYPE "LeadType" RENAME TO "LeadType_old";
ALTER TYPE "LeadType_new" RENAME TO "LeadType";
DROP TYPE "public"."LeadType_old";
ALTER TABLE "leads" ALTER COLUMN "type" SET DEFAULT 'CONTACT';
COMMIT;

-- AlterTable
ALTER TABLE "leads" DROP COLUMN "portfolio",
DROP COLUMN "role";
