/*
  Warnings:

  - Added the required column `status` to the `cook_history` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CookedStatus" AS ENUM ('TO_COOK', 'COOKED');

-- AlterTable
ALTER TABLE "cook_history" ADD COLUMN     "status" "CookedStatus" NOT NULL;
