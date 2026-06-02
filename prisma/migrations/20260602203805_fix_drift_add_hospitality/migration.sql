-- AlterEnum
ALTER TYPE "ItemCategory" ADD VALUE 'HOSPITALITY';

-- AlterTable
ALTER TABLE "Item" DROP COLUMN IF EXISTS "usageType";

-- DropEnum
DROP TYPE IF EXISTS "UsageType";
