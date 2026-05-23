-- Migrate Team from single category to categories array
-- Copy existing category data into the new array column, then drop old column

ALTER TABLE "Team" ADD COLUMN "categories" "ItemCategory"[] NOT NULL DEFAULT ARRAY['MATERIALS_STATIONERY']::"ItemCategory"[];

UPDATE "Team" SET "categories" = ARRAY["category"::"ItemCategory"];

ALTER TABLE "Team" ALTER COLUMN "categories" DROP DEFAULT;

ALTER TABLE "Team" DROP COLUMN "category";
