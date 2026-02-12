/*
  Warnings:

  - Changed the type of `status` on the `cook_history` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CookStatus" AS ENUM ('TO_COOK', 'COOKED');

-- AlterTable
ALTER TABLE "cook_history" DROP COLUMN "status",
ADD COLUMN     "status" "CookStatus" NOT NULL;

-- DropEnum
DROP TYPE "CookedStatus";
