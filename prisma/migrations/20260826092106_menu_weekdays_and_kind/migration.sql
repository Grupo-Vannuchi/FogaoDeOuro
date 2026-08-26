-- Um prato passa a valer para vários dias, e ganha seção e descrição longa.
--
-- O `weekday` anterior comportava um único dia, então "frango grelhado" —
-- servido segunda, quarta e quinta — exigiria três cadastros e três correções
-- a cada ajuste de texto. `weekdays` guarda a lista.

-- CreateEnum
CREATE TYPE "MenuItemKind" AS ENUM ('BUFFET', 'PASTA');

-- AlterTable
ALTER TABLE "menu_items"
  ADD COLUMN     "descriptionLong" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN     "kind" "MenuItemKind" NOT NULL DEFAULT 'BUFFET',
  ADD COLUMN     "weekdays" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- Backfill antes de derrubar a coluna antiga: o dia único vira lista de um.
UPDATE "menu_items" SET "weekdays" = ARRAY["weekday"] WHERE "weekday" IS NOT NULL;

-- DropColumn
ALTER TABLE "menu_items" DROP COLUMN "weekday";

-- CreateIndex
CREATE INDEX "menu_items_kind_available_order_idx" ON "menu_items"("kind", "available", "order");
