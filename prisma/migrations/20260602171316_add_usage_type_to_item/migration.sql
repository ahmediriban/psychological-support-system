-- CreateEnum
CREATE TYPE "UsageType" AS ENUM ('SINGLE_USE', 'MULTI_USE');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "usageType" "UsageType" NOT NULL DEFAULT 'SINGLE_USE';
