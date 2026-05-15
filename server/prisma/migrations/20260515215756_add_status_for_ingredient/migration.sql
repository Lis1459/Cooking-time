-- CreateEnum
CREATE TYPE "IngredientStatus" AS ENUM ('Verified', 'NotVerified');

-- AlterTable
ALTER TABLE "ingredients" ADD COLUMN     "status" "IngredientStatus" NOT NULL DEFAULT 'NotVerified';
